"""
features.py
-----------
Minimal day-only features for Tradegist.

Inputs: a round-trip trades DataFrame with at least:
    trade_id, user_id, trade_date, realized_pnl
(Other useful columns like qty, entry_price, ticker can be present and are preserved.)

Outputs: same rows + these columns:
    ft_outcome     -> 'win' | 'loss' | 'breakeven'
    ft_large_win   -> True/False (top X% wins for that user)
    ft_large_loss  -> True/False (bottom X% losses by abs for that user)
    ft_revenge     -> True/False (day flagged as "revenge" by heuristic)
    (helpers for UI) ft_day_trades_count, ft_day_pnl
"""

from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Iterable

# ---------- Tunables (adjust as you learn) ----------
EPS_PNL = 0.01         # tolerance around 0 to classify breakeven vs win/loss
LARGE_WIN_PCT = 0.90   # top 10% of wins flagged as large wins
LARGE_LOSS_PCT = 0.90  # bottom 10% of losses (by abs) flagged as large losses
REVENGE_TRADE_MIN = 3  # if trades-in-day > this AND there was a loss, mark ft_revenge

# ---------- Small helpers ----------
def _require(df: pd.DataFrame, cols: Iterable[str]) -> None:
    """Fail fast if required columns are missing."""
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required trade columns: {missing}")

def _flag_large_win(s: pd.Series, quantile: float) -> pd.Series:
    """
    Flag trades that fall into the top-quantile of WINS (per user).
    Example: quantile=0.90 => top 10% of winning trades.
    Non-wins return False.
    """
    s = pd.to_numeric(s, errors="coerce")
    wins_only = s.where(s > 0, 0.0)           # keep wins, zero out others
    cutoff = wins_only.quantile(quantile)     # e.g., 90th percentile of wins
    return (wins_only >= cutoff) & (s > 0)

def _flag_large_loss_abs(s: pd.Series, quantile: float) -> pd.Series:
    """
    Flag trades that fall into the top-quantile by ABS(LOSS) (per user).
    Example: quantile=0.90 => largest 10% of losing trades by magnitude.
    Non-losses return False.
    """
    s = pd.to_numeric(s, errors="coerce")
    losses_abs = s.where(s < 0, 0.0).abs()    # abs(losses), zero for non-losses
    cutoff = losses_abs.quantile(quantile)    # e.g., 90th percentile of |loss|
    return (s < 0) & (losses_abs >= cutoff)

def _flag_revenge_day(df: pd.DataFrame) -> pd.Series:
    """
    Heuristic revenge flag (day-level):
      - there is at least one loss that day
      - AND number of trades that day > REVENGE_TRADE_MIN
    Returns a boolean Series aligned to df rows (all trades on that day flagged).
    """
    loss_day = df.groupby(["user_id", "trade_date"])["realized_pnl"].transform(
        lambda x: (pd.to_numeric(x, errors="coerce") < -EPS_PNL).any()
    )
    count_day = df.groupby(["user_id", "trade_date"])["trade_id"].transform("count")
    return loss_day & (count_day > REVENGE_TRADE_MIN)

# ---------- Main ----------
def add_features(trades: pd.DataFrame) -> pd.DataFrame:
    """
    Add MVP features to the trades DataFrame.
    Required columns: trade_id, user_id, trade_date, realized_pnl
    """
    df = trades.copy()
    _require(df, ["trade_id", "user_id", "trade_date", "realized_pnl"])

    # Ensure types for safe comparisons/aggregations
    df["trade_date"] = pd.to_datetime(df["trade_date"])
    df["realized_pnl"] = pd.to_numeric(df["realized_pnl"], errors="coerce")

    # (Optional but helpful for UI summaries)
    day_grp = df.groupby(["user_id", "trade_date"])
    df["ft_day_trades_count"] = day_grp["trade_id"].transform("count")
    df["ft_day_pnl"] = day_grp["realized_pnl"].transform("sum")

    # 1) Outcome: win / loss / breakeven
    df["ft_outcome"] = np.where(
        df["realized_pnl"] > EPS_PNL, "win",
        np.where(df["realized_pnl"] < -EPS_PNL, "loss", "breakeven")
    )

    # 2) Large win: top X% of wins for that user
    df["ft_large_win"] = df.groupby("user_id")["realized_pnl"].transform(
        lambda s: _flag_large_win(s, LARGE_WIN_PCT)
    )

    # 3) Large loss: bottom X% of losses by magnitude for that user
    df["ft_large_loss"] = df.groupby("user_id")["realized_pnl"].transform(
        lambda s: _flag_large_loss_abs(s, LARGE_LOSS_PCT)
    )

    # 4) Revenge (day-level heuristic)
    df["ft_revenge"] = _flag_revenge_day(df)

    return df
