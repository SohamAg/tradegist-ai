"""
labels.py
---------
Convert tall tags (from rules.run_all_rules) into wide confidence-score matrices.

Outputs:
- trade_scores: one row per (user_id, trade_id) with confidence per TRADE_TAGS
- day_scores:   one row per (user_id, trade_date) with confidence per DAY_TAGS
- trade_scores_with_day: trade_scores enriched with day tag scores for that trade_date
"""

from __future__ import annotations
import pandas as pd

# Keep these lists in sync with rules.py
TRADE_TAGS = [
    "outcome_win",
    "outcome_loss",
    "outcome_breakeven",
    "large_win",
    "large_loss",
    "revenge_immediate",
    "size_inconsistency",
    # positive trade tags
    "follow_through_win_immediate",
    "disciplined_after_loss_immediate",
    "consistent_size",
]

DAY_TAGS = [
    "overtrading_day",
    "revenge_day",
    "chop_day",
    "ticker_bias_lifetime",
    "ticker_bias_recent",
    # positive day tags
    "focused_day",
    "green_day_low_activity",
]

def _pivot_scores(df: pd.DataFrame, index_cols, tag_list):
    """Pivot confidence scores to wide; if multiple rows per tag, take max(confidence)."""
    if df.empty:
        return pd.DataFrame(columns=index_cols + tag_list)
    d = df.copy()
    if "confidence" not in d.columns:
        d["confidence"] = 1.0
    wide = (
        d.pivot_table(index=index_cols, columns="tag", values="confidence",
                      aggfunc="max", fill_value=0.0)
         .reindex(columns=tag_list, fill_value=0.0)
         .reset_index()
    )
    return wide

def build_labels(trades: pd.DataFrame, tags: pd.DataFrame, propagate_day_to_trades: bool = True):
    """
    Parameters
    ----------
    trades : DataFrame
        Completed trades with at least: user_id, trade_id, trade_date, ticker
    tags : DataFrame
        Output of run_all_rules(); columns:
        [user_id, trade_id (nullable), trade_date, tag, confidence, rationale, scope, source]
    propagate_day_to_trades : bool
        If True, merge day-level scores onto each trade row (by user_id + trade_date).

    Returns
    -------
    trade_scores : DataFrame
    day_scores : DataFrame
    trade_scores_with_day : DataFrame
    """
    t = tags.copy()
    t["trade_date"] = pd.to_datetime(t["trade_date"])

    # --- Trade-level scores
    trade_rows = t.loc[t["scope"]=="trade", ["user_id","trade_id","tag","confidence"]]
    trade_scores = _pivot_scores(trade_rows, ["user_id","trade_id"], TRADE_TAGS)

    base = trades[["user_id","trade_id","trade_date","ticker"]].copy()
    base["trade_date"] = pd.to_datetime(base["trade_date"])
    trade_scores = base.merge(trade_scores, on=["user_id","trade_id"], how="left")
    for c in TRADE_TAGS:
        if c not in trade_scores.columns:
            trade_scores[c] = 0.0
    trade_scores[TRADE_TAGS] = trade_scores[TRADE_TAGS].fillna(0.0)

    # --- Day-level scores
    day_rows = t.loc[t["scope"]=="day", ["user_id","trade_date","tag","confidence"]]
    day_scores = _pivot_scores(day_rows, ["user_id","trade_date"], DAY_TAGS)

    all_days = trades[["user_id","trade_date"]].drop_duplicates()
    all_days["trade_date"] = pd.to_datetime(all_days["trade_date"])
    day_scores = all_days.merge(day_scores, on=["user_id","trade_date"], how="left")
    for c in DAY_TAGS:
        if c not in day_scores.columns:
            day_scores[c] = 0.0
    day_scores[DAY_TAGS] = day_scores[DAY_TAGS].fillna(0.0)

    # --- Optionally propagate day scores to trades
    if propagate_day_to_trades:
        trade_scores_with_day = trade_scores.merge(day_scores, on=["user_id","trade_date"], how="left", suffixes=("", "_day"))
        for c in DAY_TAGS:
            if c not in trade_scores_with_day.columns:
                trade_scores_with_day[c] = 0.0
            trade_scores_with_day[c] = trade_scores_with_day[c].fillna(0.0)
    else:
        trade_scores_with_day = trade_scores.copy()

    return trade_scores, day_scores, trade_scores_with_day
