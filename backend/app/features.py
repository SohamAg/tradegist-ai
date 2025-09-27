"""
features.py
-----------
Day-only feature engineering for Tradegist.

Requires input trades with at least:
    trade_id, user_id, trade_date, ticker, qty, entry_price, realized_pnl

Emits the same rows plus these features (ft_*):
    Outcome/extremes:
        ft_outcome ('win'|'loss'|'breakeven')
        ft_large_win (bool)     # top decile wins per user
        ft_large_loss (bool)    # worst decile losses per user (by |PnL|)
    Size:
        ft_notional (qty * entry_price)
        ft_size_z (robust z-score of notional per user)
    Same-day sequencing/context:
        ft_prev_outcome_day
        ft_immediate_after_prev (bool)
        ft_same_ticker_as_prev_day (bool)
    Day aggregates:
        ft_day_trades_count
        ft_day_pnl
"""

#user iD for the timebeing: 36e6fe5b-d920-4cba-9f20-6538ba499327

from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Iterable

# ---------- Tunables ----------
EPS_PNL = 1.00          # $1 tolerance => |PnL| <= EPS_PNL => breakeven
LARGE_WIN_PCT = 0.90    # top decile wins => large_win
LARGE_LOSS_PCT = 0.90   # worst decile losses (by abs) => large_loss


# ---------- Helpers ----------
def _require(df: pd.DataFrame, cols: Iterable[str]) -> None:
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required trade columns: {missing}")

def _robust_z(x: pd.Series) -> pd.Series:
    x = pd.to_numeric(x, errors="coerce")
    med = x.median()
    mad = (x - med).abs().median()
    if mad == 0 or np.isnan(mad):
        return pd.Series(np.zeros(len(x)), index=x.index, dtype=float)
    return (x - med) / (1.4826 * mad)

def _flag_large_win(s: pd.Series, pct: float) -> pd.Series:
    s = pd.to_numeric(s, errors="coerce")
    wins = s.where(s > 0, 0.0)
    thr = wins.quantile(pct)
    return (wins >= thr) & (s > 0)

def _flag_large_loss_abs(s: pd.Series, pct: float) -> pd.Series:
    s = pd.to_numeric(s, errors="coerce")
    losses_abs = s.where(s < 0, 0.0).abs()
    thr = losses_abs.quantile(pct)
    return (s < 0) & (losses_abs >= thr)


# ---------- Main ----------
def compute_features(trades: pd.DataFrame) -> pd.DataFrame:
    """
    Add engineered features needed by rules.py.

    Parameters
    ----------
    trades : DataFrame
        Columns required:
            trade_id, user_id, trade_date, ticker, qty, entry_price, realized_pnl

    Returns
    -------
    DataFrame
        Input rows + ft_* columns as documented above.
    """
    df = trades.copy()
    _require(df, ["trade_id", "user_id", "trade_date", "ticker", "qty", "entry_price", "realized_pnl"])

    # Normalize types
    df["trade_date"] = pd.to_datetime(df["trade_date"])
    for c in ("qty", "entry_price", "realized_pnl"):
        df[c] = pd.to_numeric(df[c], errors="coerce")

    # Stable order (needed for same-day "previous" logic)
    df = df.sort_values(["user_id", "trade_date", "trade_id"]).reset_index(drop=True)

    # Outcome layer
    df["ft_outcome"] = np.where(
        df["realized_pnl"] > EPS_PNL, "win",
        np.where(df["realized_pnl"] < -EPS_PNL, "loss", "breakeven")
    )

    # Size features
    df["ft_notional"] = df["qty"] * df["entry_price"]
    df["ft_size_z"]   = df.groupby("user_id")["ft_notional"].transform(_robust_z)

    # Same-day sequencing/context
    gday = df.groupby(["user_id", "trade_date"], sort=False)
    # previous trade outcome within day
    df["ft_prev_outcome_day"] = gday["ft_outcome"].shift(1)
    # previous ticker within day (drop after boolean is computed)
    prev_ticker = gday["ticker"].shift(1)
    df["ft_same_ticker_as_prev_day"] = (df["ticker"] == prev_ticker).fillna(False)
    # immediate next after previous (i.e., no gaps)
    seq_in_day = gday.cumcount() + 1
    df["ft_immediate_after_prev"] = (seq_in_day == (gday["trade_id"].shift(1).notna().astype(int) + (seq_in_day.shift(1).fillna(0)))).fillna(False)
    # The line above is a bit opaque; simpler equivalent:
    df["ft_immediate_after_prev"] = (gday.cumcount() == gday.cumcount().shift(1) + 1).fillna(False)

    # Day aggregates
    df["ft_day_trades_count"] = gday["trade_id"].transform("count")
    df["ft_day_pnl"]          = gday["realized_pnl"].transform("sum")

    # Extremes (per user)
    df["ft_large_win"]  = df.groupby("user_id")["realized_pnl"].transform(lambda s: _flag_large_win(s, LARGE_WIN_PCT))
    df["ft_large_loss"] = df.groupby("user_id")["realized_pnl"].transform(lambda s: _flag_large_loss_abs(s, LARGE_LOSS_PCT))

    # Ensure boolean dtype for bool features
    for b in ["ft_large_win", "ft_large_loss", "ft_same_ticker_as_prev_day", "ft_immediate_after_prev"]:
        df[b] = df[b].astype(bool)

    return df
