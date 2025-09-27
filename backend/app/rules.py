# backend/app/rules.py
# ------------------------------------------------------------
# Rule-based classifiers (behavioral tendencies) — day-only.
# Inputs: DataFrame returned by features.compute_features()
# Output: tidy tags table: [user_id, trade_id (nullable), trade_date, tag, confidence, rationale, scope, source]
# ------------------------------------------------------------

from __future__ import annotations
import pandas as pd
import numpy as np

# ---------- Tunables ----------
OVERTRADING_SOFT = 10
OVERTRADING_HARD = 20
CHOP_ABS_PNL_MAX = 50.0     # set None to disable "chop_day"

SIZE_Z_THRESHOLD = 2.0      # >= this => oversize / inconsistent risk

REVENGE_TRADE_MIN = 3       # for revenge_day heuristic (loss present + many trades)

# Ticker Bias (lifetime)
TICKER_BIAS_MIN_TRADES = 5
TICKER_BIAS_MEAN_PNL_MAX = -0.01  # mean pnl per trade <= this → biased negative

# Ticker Bias (recent window)
TICKER_BIAS_RECENT_K = 5          # evaluate last K trades per (user,ticker)
TICKER_BIAS_RECENT_MEAN_MAX = -0.01

def _emit_trade_tags(df: pd.DataFrame, mask: pd.Series, tag: str, conf: float, rationale_fn):
    sub = df.loc[mask, ["user_id","trade_id","trade_date","realized_pnl"]].copy()
    if sub.empty:
        return pd.DataFrame(columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"])
    sub["tag"] = tag
    sub["confidence"] = conf
    sub["rationale"] = sub.apply(rationale_fn, axis=1)
    sub["scope"] = "trade"
    sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def _emit_day_tags(df_day: pd.DataFrame, tag: str, conf: float, rationale_fn, extra_cols=None):
    """
    Emit one day-level tag per (user, date). You can pass extra_cols (e.g. ['ticker','recent_mean'])
    to be available to rationale_fn.
    """
    if df_day.empty:
        return pd.DataFrame(columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"])
    base_cols = ["user_id", "trade_date"]
    cols = base_cols + (extra_cols or [])
    cols = [c for c in cols if c in df_day.columns]
    out = df_day[cols].drop_duplicates().copy()
    out["trade_id"] = None
    out["tag"] = tag
    out["confidence"] = conf
    out["rationale"] = out.apply(rationale_fn, axis=1)
    out["scope"] = "day"
    out["source"] = "rule"
    return out[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

# ----------- Rules -----------

def rule_outcome(f: pd.DataFrame) -> pd.DataFrame:
    parts = []
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="win", "outcome_win", 0.9,
                                  lambda r: f"Win: PnL ${r.realized_pnl:.2f}"))
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="loss", "outcome_loss", 0.9,
                                  lambda r: f"Loss: PnL ${r.realized_pnl:.2f}"))
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="breakeven", "outcome_breakeven", 0.8,
                                  lambda r: "Breakeven within tolerance"))
    return pd.concat([p for p in parts if not p.empty], ignore_index=True) if parts else pd.DataFrame()

def rule_large_win_loss(f: pd.DataFrame) -> pd.DataFrame:
    parts = []
    parts.append(_emit_trade_tags(f, f["ft_large_win"].astype(bool), "large_win", 0.75,
                                  lambda r: f"Top-decile win for this user (PnL ${r.realized_pnl:.2f})"))
    parts.append(_emit_trade_tags(f, f["ft_large_loss"].astype(bool), "large_loss", 0.85,
                                  lambda r: f"Worst-decile loss for this user (PnL ${r.realized_pnl:.2f})"))
    return pd.concat([p for p in parts if not p.empty], ignore_index=True) if parts else pd.DataFrame()

def rule_overtrading_day(f: pd.DataFrame) -> pd.DataFrame:
    day = (f.groupby(["user_id","trade_date"])
             .agg(trades=("trade_id","nunique"), pnl=("realized_pnl","sum"))
             .reset_index())
    day["soft"] = day["trades"] >= OVERTRADING_SOFT
    day["hard"] = day["trades"] >= OVERTRADING_HARD
    flagged = day[(day["soft"] | day["hard"])].copy()
    if flagged.empty:
        return pd.DataFrame()
    return _emit_day_tags(
        flagged, "overtrading_day", 0.0,
        lambda r: f"{int(r.trades)} trades; day PnL ${float(r.pnl):.2f}"
    ).assign(confidence=lambda d: d.apply(
        lambda r: 0.85 if int(day[(day.user_id==r.user_id)&(day.trade_date==r.trade_date)]["trades"])>=OVERTRADING_HARD else 0.7, axis=1
    ))

def rule_revenge_day(f: pd.DataFrame) -> pd.DataFrame:
    # Heuristic: at least one loss & trades count > REVENGE_TRADE_MIN
    g = f.groupby(["user_id","trade_date"])
    has_loss = g["realized_pnl"].transform(lambda s: (s < -0.01).any())
    many_trades = g["trade_id"].transform("count") > REVENGE_TRADE_MIN
    mask = (has_loss & many_trades)
    flagged_days = f.loc[mask, ["user_id","trade_date"]].drop_duplicates()
    return _emit_day_tags(flagged_days, "revenge_day", 0.7, lambda r: "Loss present + high activity")

def rule_revenge_immediate_same_day(f: pd.DataFrame) -> pd.DataFrame:
    # Previous trade that day was a loss, and this trade is immediately after
    mask = (f["ft_prev_outcome_day"]=="loss") & (f["ft_immediate_after_prev"]==1)
    # Optional: boost confidence if same ticker
    conf = np.where(f["ft_same_ticker_as_prev_day"]==1, 0.85, 0.7)
    sub = f.loc[mask, ["user_id","trade_id","trade_date","realized_pnl","ft_same_ticker_as_prev_day"]].copy()
    if sub.empty:
        return pd.DataFrame(columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"])
    sub["tag"] = "revenge_immediate"
    sub["confidence"] = np.where(sub["ft_same_ticker_as_prev_day"]==1, 0.85, 0.7)
    sub["rationale"] = sub.apply(lambda r: "Immediate re-entry after loss" + (" (same ticker)" if r.ft_same_ticker_as_prev_day==1 else ""), axis=1)
    sub["scope"] = "trade"
    sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def rule_size_inconsistency(f: pd.DataFrame) -> pd.DataFrame:
    mask = f["ft_size_z"] >= SIZE_Z_THRESHOLD
    sub = f.loc[mask, ["user_id","trade_id","trade_date","realized_pnl","ft_size_z","ft_notional"]].copy()
    if sub.empty:
        return pd.DataFrame(columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"])
    sub["tag"] = "size_inconsistency"
    sub["confidence"] = 0.75
    sub["rationale"] = sub.apply(
        lambda r: f"Size {r.ft_size_z:.1f}σ above your median (notional ${float(r.ft_notional):,.0f})",
        axis=1
    )
    sub["scope"] = "trade"
    sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def rule_chop_day(f: pd.DataFrame) -> pd.DataFrame:
    if CHOP_ABS_PNL_MAX is None:
        return pd.DataFrame()
    day = (f.groupby(["user_id","trade_date"])
             .agg(trades=("trade_id","nunique"), pnl=("realized_pnl","sum"))
             .reset_index())
    flagged = day[(day["trades"] >= OVERTRADING_SOFT) & (day["pnl"].abs() <= CHOP_ABS_PNL_MAX)]
    return _emit_day_tags(flagged, "chop_day", 0.6,
                          lambda r: f"High activity ({int(r.trades)}) with flat PnL ${float(r.pnl):.2f}")

def rule_ticker_bias_basic(f: pd.DataFrame) -> pd.DataFrame:
    """
    Two signals:
    1) Lifetime bias: mean PnL per (user,ticker) <= threshold with enough samples.
    2) Recent-window bias: last K trades in (user,ticker) have negative mean PnL.
    Emits DAY-level tags referencing the trade's date.
    """
    out = []

    # ---- Lifetime ----
    life = (f.groupby(["user_id","ticker"])
              .agg(n=("trade_id","nunique"),
                   mean_pnl=("realized_pnl","mean"),
                   total=("realized_pnl","sum"))
              .reset_index())

    life_flag = life[(life["n"] >= TICKER_BIAS_MIN_TRADES) &
                     (life["mean_pnl"] <= TICKER_BIAS_MEAN_PNL_MAX)].copy()

    if not life_flag.empty:
        joined = f.merge(life_flag[["user_id","ticker","n","mean_pnl","total"]],
                         on=["user_id","ticker"], how="inner")
        out.append(_emit_day_tags(
            joined[["user_id","trade_date","ticker","n","mean_pnl","total"]],
            "ticker_bias_lifetime", 0.8,
            rationale_fn=lambda r: (
                f"Ticker {r.ticker} shows negative expectancy "
                f"(n={int(r.n)}, avg PnL ${float(r.mean_pnl):.2f}, total ${float(r.total):.2f})"
            ),
            extra_cols=["ticker","n","mean_pnl","total"]
        ))

    # ---- Recent K trades ----
    # Sort once, then compute last-K mean per (user,ticker) without the deprecation warning
    ordered = f.sort_values(["user_id","ticker","trade_date","trade_id"])
    rec = (ordered.groupby(["user_id","ticker"], group_keys=False)
                  .apply(lambda g: pd.Series({"recent_mean": g.tail(TICKER_BIAS_RECENT_K)["realized_pnl"].mean()}))
                  .reset_index())

    rec_flag = rec[rec["recent_mean"] <= TICKER_BIAS_RECENT_MEAN_MAX]
    if not rec_flag.empty:
        joined = f.merge(rec_flag, on=["user_id","ticker"], how="inner")
        out.append(_emit_day_tags(
            joined[["user_id","trade_date","ticker","recent_mean"]],
            "ticker_bias_recent", 0.7,
            rationale_fn=lambda r: (
                f"Ticker {r.ticker}: last {TICKER_BIAS_RECENT_K} trades mean PnL "
                f"${float(0.0 if pd.isna(r.recent_mean) else r.recent_mean):.2f}"
            ),
            extra_cols=["ticker","recent_mean"]
        ))

    return pd.concat(out, ignore_index=True) if out else pd.DataFrame()

    # Recent window K
    def last_k_mean(group: pd.DataFrame) -> float:
        g = group.sort_values(["trade_date","trade_id"])
        return g.tail(TICKER_BIAS_RECENT_K)["realized_pnl"].mean()

    rec = (f.groupby(["user_id","ticker"])
             .apply(last_k_mean)
             .reset_index(name="recent_mean"))
    rec_flag = rec[rec["recent_mean"] <= TICKER_BIAS_RECENT_MEAN_MAX]
    if not rec_flag.empty:
        joined = f.merge(rec_flag, on=["user_id","ticker"], how="inner")
        out.append(_emit_day_tags(
            joined[["user_id","trade_date","ticker","recent_mean"]].drop_duplicates(),
            "ticker_bias_recent", 0.7,
            lambda r: f"Last {TICKER_BIAS_RECENT_K} trades mean PnL ${float(r.recent_mean):.2f}"
        ))

    return pd.concat(out, ignore_index=True) if out else pd.DataFrame()

# ----------- Orchestrator -----------

def run_all_rules(features: pd.DataFrame) -> pd.DataFrame:
    parts = [
        rule_outcome(features),
        rule_large_win_loss(features),
        rule_overtrading_day(features),
        rule_revenge_day(features),
        rule_revenge_immediate_same_day(features),
        rule_size_inconsistency(features),
        rule_chop_day(features),              # optional; disable via CHOP_ABS_PNL_MAX=None
        rule_ticker_bias_basic(features),
    ]
    parts = [p for p in parts if p is not None and not p.empty]
    if not parts:
        return pd.DataFrame(columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"])
    tags = pd.concat(parts, ignore_index=True)
    tags = tags.drop_duplicates(subset=["user_id","trade_id","trade_date","tag","rationale","scope"], keep="first")
    return tags
