"""
rules.py
--------
Rule-based classifiers (behavioral tendencies) consuming features from features.compute_features().

Input (features DataFrame) must include at least:
    user_id, trade_id, trade_date, ticker, realized_pnl,
    ft_outcome, ft_large_win, ft_large_loss,
    ft_prev_outcome_day, ft_immediate_after_prev, ft_same_ticker_as_prev_day,
    ft_size_z, ft_notional

Output: tidy tags table with columns:
    [user_id, trade_id (nullable), trade_date, tag, confidence, rationale, scope('trade'|'day'), source]
"""

from __future__ import annotations
import pandas as pd
import numpy as np

# ---------- Tunables (chosen) ----------
EPS_PNL = 1.00                       # $1 tolerance (used in a couple of day checks)

OVERTRADING_SOFT = 5                 # >= 5 trades/day => overtrading
OVERTRADING_HARD = 5                 # identical to soft in this version

CHOP_ABS_PNL_MAX = 50.0              # |day PnL| <= $50 with high activity => chop_day

SIZE_Z_THRESHOLD = 2.0               # size inconsistency => >= 2 sigma
DISCIPLINED_SIZE_Z_MAX = 0.5         # “disciplined” re-entry keeps size within ~0.5σ
CONSISTENT_SIZE_Z_ABS_MAX = 0.5      # consistent sizing band

LOW_ACTIVITY_MAX = 3                 # green_day_low_activity threshold

# Ticker Bias thresholds
TICKER_BIAS_MIN_TRADES = 5           # lifetime min samples on a ticker
TICKER_BIAS_MEAN_PNL_MAX = -10.0     # lifetime mean pnl/trade <= -$10

TICKER_BIAS_RECENT_K = 5             # recent window K
TICKER_BIAS_RECENT_MEAN_MAX = -5.0   # last K mean <= -$5


# ---------- Emit helpers ----------
def _empty_tags() -> pd.DataFrame:
    return pd.DataFrame(
        columns=["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]
    )

def _emit_trade_tags(df: pd.DataFrame, mask: pd.Series, tag: str, conf: float, rationale_fn, extra_cols=None) -> pd.DataFrame:
    base_cols = ["user_id", "trade_id", "trade_date", "realized_pnl"]
    cols = [c for c in (base_cols + (extra_cols or [])) if c in df.columns]
    sub = df.loc[mask, cols].copy()
    if sub.empty:
        return _empty_tags()
    sub["tag"] = tag
    sub["confidence"] = conf
    sub["rationale"] = sub.apply(rationale_fn, axis=1)
    sub["scope"] = "trade"
    sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def _emit_day_tags(df_day: pd.DataFrame, tag: str, default_conf: float, rationale_fn, extra_cols=None, use_row_conf: bool=False) -> pd.DataFrame:
    """
    If use_row_conf=True, expects a 'confidence' column in df_day and uses it per row.
    Otherwise applies default_conf to all rows.
    """
    if df_day.empty:
        return _empty_tags()
    base_cols = ["user_id", "trade_date"]
    cols = [c for c in (base_cols + (extra_cols or [])) if c in df_day.columns]
    out = df_day[cols].drop_duplicates().copy()
    out["trade_id"] = None
    out["tag"] = tag
    out["confidence"] = out["confidence"] if (use_row_conf and "confidence" in out.columns) else default_conf
    out["rationale"] = out.apply(rationale_fn, axis=1)
    out["scope"] = "day"
    out["source"] = "rule"
    return out[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]


# ---------- Core trade-level rules (negative/neutral) ----------
def rule_outcome(f: pd.DataFrame) -> pd.DataFrame:
    parts = []
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="win", "outcome_win", 0.9,
                                  lambda r: f"Win: PnL ${float(r.realized_pnl):.2f}"))
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="loss", "outcome_loss", 0.9,
                                  lambda r: f"Loss: PnL ${float(r.realized_pnl):.2f}"))
    parts.append(_emit_trade_tags(f, f["ft_outcome"]=="breakeven", "outcome_breakeven", 0.8,
                                  lambda r: "Breakeven within tolerance"))
    return pd.concat([p for p in parts if not p.empty], ignore_index=True) if parts else _empty_tags()

def rule_large_win_loss(f: pd.DataFrame) -> pd.DataFrame:
    parts = []
    parts.append(_emit_trade_tags(f, f["ft_large_win"].astype(bool), "large_win", 0.75,
                                  lambda r: f"Top-decile win (PnL ${float(r.realized_pnl):.2f})"))
    parts.append(_emit_trade_tags(f, f["ft_large_loss"].astype(bool), "large_loss", 0.85,
                                  lambda r: f"Worst-decile loss (PnL ${float(r.realized_pnl):.2f})"))
    return pd.concat([p for p in parts if not p.empty], ignore_index=True) if parts else _empty_tags()

def rule_revenge_immediate_same_day(f: pd.DataFrame) -> pd.DataFrame:
    mask = (f["ft_prev_outcome_day"]=="loss") & (f["ft_immediate_after_prev"].astype(bool))
    sub = f.loc[mask, ["user_id","trade_id","trade_date","realized_pnl","ft_same_ticker_as_prev_day"]].copy()
    if sub.empty:
        return _empty_tags()
    sub["tag"] = "revenge_immediate"
    sub["confidence"] = np.where(sub["ft_same_ticker_as_prev_day"].astype(bool), 0.9, 0.75)
    sub["rationale"] = sub.apply(
        lambda r: "Immediate re-entry after loss" + (" (same ticker)" if bool(r.ft_same_ticker_as_prev_day) else ""),
        axis=1
    )
    sub["scope"] = "trade"; sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def rule_size_inconsistency(f: pd.DataFrame) -> pd.DataFrame:
    mask = f["ft_size_z"] >= SIZE_Z_THRESHOLD
    return _emit_trade_tags(
        f, mask, "size_inconsistency", 0.75,
        lambda r: f"Size {float(getattr(r,'ft_size_z',0)):.1f}σ above median (notional ${float(getattr(r,'ft_notional',0)):,.0f})",
        extra_cols=["ft_size_z","ft_notional"]
    )


# ---------- Day-level (negative/neutral) ----------
def _day_agg(f: pd.DataFrame) -> pd.DataFrame:
    return (f.groupby(["user_id","trade_date"])
              .agg(trades=("trade_id","nunique"),
                   pnl=("realized_pnl","sum"))
              .reset_index())

def rule_overtrading_day(f: pd.DataFrame) -> pd.DataFrame:
    day = _day_agg(f)
    flagged = day[day["trades"] >= OVERTRADING_SOFT]
    if flagged.empty: return _empty_tags()
    return _emit_day_tags(flagged, "overtrading_day", 0.8,
                          lambda r: f"{int(r.trades)} trades; day PnL ${float(r.pnl):.2f}",
                          extra_cols=["trades","pnl"])

def rule_revenge_day(f: pd.DataFrame) -> pd.DataFrame:
    # Either: has any revenge_immediate in that day, OR (has loss and many trades)
    rev_imm_mask = (f["ft_prev_outcome_day"]=="loss") & (f["ft_immediate_after_prev"].astype(bool))
    rev_imm_days = f.loc[rev_imm_mask, ["user_id","trade_date"]].drop_duplicates()

    g = f.groupby(["user_id","trade_date"])
    has_loss = g["realized_pnl"].transform(lambda s: (s < -EPS_PNL).any())
    many_trades = g["trade_id"].transform("count") >= OVERTRADING_SOFT
    fallback_days = f.loc[(has_loss & many_trades), ["user_id","trade_date"]].drop_duplicates()

    flagged = pd.concat([rev_imm_days, fallback_days], ignore_index=True).drop_duplicates()
    if flagged.empty: return _empty_tags()
    return _emit_day_tags(flagged, "revenge_day", 0.75,
                          lambda r: "Loss-anchored high-activity episode")

def rule_chop_day(f: pd.DataFrame) -> pd.DataFrame:
    day = _day_agg(f)
    flagged = day[(day["trades"] >= OVERTRADING_SOFT) & (day["pnl"].abs() <= CHOP_ABS_PNL_MAX)]
    if flagged.empty: return _empty_tags()
    return _emit_day_tags(flagged, "chop_day", 0.6,
                          lambda r: f"High activity ({int(r.trades)}) with flat PnL ${float(r.pnl):.2f}",
                          extra_cols=["trades","pnl"])


# ---------- Ticker bias (day-level emissions) ----------
def rule_ticker_bias_basic(f: pd.DataFrame) -> pd.DataFrame:
    out = []

    # Lifetime bias
    life = (f.groupby(["user_id","ticker"])
              .agg(n=("trade_id","nunique"),
                   mean_pnl=("realized_pnl","mean"),
                   total=("realized_pnl","sum"))
              .reset_index())
    life_flag = life[(life["n"] >= TICKER_BIAS_MIN_TRADES) &
                     (life["mean_pnl"] <= TICKER_BIAS_MEAN_PNL_MAX)]
    if not life_flag.empty:
        joined = f.merge(life_flag[["user_id","ticker","n","mean_pnl","total"]],
                         on=["user_id","ticker"], how="inner")
        out.append(_emit_day_tags(
            joined[["user_id","trade_date","ticker","n","mean_pnl","total"]],
            "ticker_bias_lifetime", 0.8,
            rationale_fn=lambda r: (
                f"Ticker {r.ticker} negative expectancy (n={int(r.n)}, avg ${float(r.mean_pnl):.2f}, total ${float(r.total):.2f})"
            ),
            extra_cols=["ticker","n","mean_pnl","total"]
        ))

    # Recent K trades (K=5)
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
                f"Ticker {r.ticker}: last {TICKER_BIAS_RECENT_K} trades mean ${float(0.0 if pd.isna(r.recent_mean) else r.recent_mean):.2f}"
            ),
            extra_cols=["ticker","recent_mean"]
        ))

    return pd.concat(out, ignore_index=True) if out else _empty_tags()


# ---------- Positive trade-level rules ----------
def rule_follow_through_win_immediate(f: pd.DataFrame) -> pd.DataFrame:
    mask = (f["ft_prev_outcome_day"]=="win") & (f["ft_immediate_after_prev"].astype(bool))
    sub = f.loc[mask, ["user_id","trade_id","trade_date","ft_same_ticker_as_prev_day"]].copy()
    if sub.empty: return _empty_tags()
    sub["tag"] = "follow_through_win_immediate"
    sub["confidence"] = np.where(sub["ft_same_ticker_as_prev_day"].astype(bool), 0.85, 0.7)
    sub["rationale"] = sub.apply(
        lambda r: "Immediate follow-through after win" + (" (same ticker)" if bool(r.ft_same_ticker_as_prev_day) else ""),
        axis=1
    )
    sub["scope"] = "trade"; sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def rule_disciplined_after_loss_immediate(f: pd.DataFrame) -> pd.DataFrame:
    mask = (
        (f["ft_prev_outcome_day"]=="loss") &
        (f["ft_immediate_after_prev"].astype(bool)) &
        (f["ft_size_z"] <= DISCIPLINED_SIZE_Z_MAX)
    )
    sub = f.loc[mask, ["user_id","trade_id","trade_date","ft_size_z"]].copy()
    if sub.empty: return _empty_tags()
    sub["tag"] = "disciplined_after_loss_immediate"
    sub["confidence"] = 0.8
    sub["rationale"] = sub.apply(
        lambda r: f"Composed re-entry after loss (size {float(r.ft_size_z):.1f}σ, within discipline)",
        axis=1
    )
    sub["scope"] = "trade"; sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]

def rule_consistent_size(f: pd.DataFrame) -> pd.DataFrame:
    mask = f["ft_size_z"].abs() <= CONSISTENT_SIZE_Z_ABS_MAX
    sub = f.loc[mask, ["user_id","trade_id","trade_date","ft_size_z"]].copy()
    if sub.empty: return _empty_tags()
    sub["tag"] = "consistent_size"
    sub["confidence"] = 0.6
    sub["rationale"] = sub.apply(
        lambda r: f"Consistent position sizing ({float(r.ft_size_z):.1f}σ from typical)",
        axis=1
    )
    sub["scope"] = "trade"; sub["source"] = "rule"
    return sub[["user_id","trade_id","trade_date","tag","confidence","rationale","scope","source"]]


# ---------- Positive day-level rules ----------
def rule_focused_day(features):
    out = []
    for (user, day), sub in features.groupby(["user_id", "trade_date"]):
        tickers = sub["ticker"].nunique()
        day_pnl = sub["realized_pnl"].sum()
        n_trades = len(sub)

        if tickers == 1:
            if day_pnl > 0:
                conf = 1.0 if n_trades <= 5 else 0.85
            else:
                conf = 0.6
        else:
            # Partial focus if one ticker dominates
            top_frac = sub["ticker"].value_counts(normalize=True).iloc[0]
            conf = 0.5 if top_frac >= 0.8 else 0.0

        if conf > 0:
            out.append(dict(
                user_id=user, trade_date=day, scope="day",
                tag="focused_day", confidence=conf,
                rationale=f"{tickers} tickers, PnL {day_pnl:.2f}, trades={n_trades}"
            ))
    return pd.DataFrame(out)

def rule_green_day_low_activity(features):
    out = []
    for (user, day), sub in features.groupby(["user_id", "trade_date"]):
        n_trades = len(sub)
        day_pnl = sub["realized_pnl"].sum()

        if n_trades <= 2 and day_pnl > 0:
            if day_pnl >= 200:      # strong profit
                conf = 1.0
            elif day_pnl >= 50:     # moderate profit
                conf = 0.8
            else:                   # small profit
                conf = 0.6
            out.append(dict(
                user_id=user, trade_date=day, scope="day",
                tag="green_day_low_activity", confidence=conf,
                rationale=f"{n_trades} trades, PnL {day_pnl:.2f}"
            ))
    return pd.DataFrame(out)


# ---------- Orchestrator ----------
def run_all_rules(features: pd.DataFrame) -> pd.DataFrame:
    parts = [
        # core trade-level
        rule_outcome(features),
        rule_large_win_loss(features),
        rule_revenge_immediate_same_day(features),
        rule_size_inconsistency(features),

        # core day-level
        rule_overtrading_day(features),
        rule_revenge_day(features),
        rule_chop_day(features),
        rule_ticker_bias_basic(features),

        # positive reinforcement
        rule_follow_through_win_immediate(features),
        rule_disciplined_after_loss_immediate(features),
        rule_consistent_size(features),
        rule_focused_day(features),
        rule_green_day_low_activity(features),
    ]
    parts = [p for p in parts if p is not None and not p.empty]
    if not parts:
        return _empty_tags()
    tags = pd.concat(parts, ignore_index=True)
    tags = tags.drop_duplicates(subset=["user_id","trade_id","trade_date","tag","rationale","scope"], keep="first")
    return tags
