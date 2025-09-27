"""
full_pipeline.py
Simplified end-to-end pipeline:
    Raw ledger -> Executions -> Round-trips -> Features -> Rules -> Labels

Assumes:
    - Input raw ledger at: backend/data/mocksmall.csv
    - User ID: demo_user
    - Output directory: backend/data/
"""

import pandas as pd
from pathlib import Path

from ingest import load_ledger, fifo_round_trips
from features import compute_features
from rules import run_all_rules
from labels import build_labels


def main():
    # Standard paths
    ledger_path = "data/mock_trades_realistic.csv"     # <- points to backend/data/
    user_id = "demo_user"
    outdir = Path("data")                  # <- saves to backend/data/
    outdir.mkdir(parents=True, exist_ok=True)

    # ---------- 1. Ingest ----------
    print("\n[1/5] Ingesting ledger ...")
    execs, cash = load_ledger(ledger_path, user_id=user_id)
    trades = fifo_round_trips(execs)

    trades.to_csv(outdir / "trades_roundtrips.csv", index=False)
    cash.to_csv(outdir / "cash_events.csv", index=False)

    print(f"  - Executions: {len(execs)} | Trades: {len(trades)} | Cash events: {len(cash)}")

    if trades.empty:
        print("No completed trades found. Stopping here.")
        return

    # ---------- 2. Features ----------
    print("\n[2/5] Computing features ...")
    feat = compute_features(trades)
    feat.to_csv(outdir / "trade_features.csv", index=False)
    print(f"  - Features: {feat.shape}")

    # ---------- 3. Rules ----------
    print("\n[3/5] Running behavior rules ...")
    tags = run_all_rules(feat)
    tags.to_csv(outdir / "tags.csv", index=False)
    print(f"  - Tags emitted: {len(tags)}")

    # ---------- 4. Labels ----------
    print("\n[4/5] Building label matrices ...")
    trades["trade_date"] = pd.to_datetime(trades["trade_date"])
    if not tags.empty:
        tags["trade_date"] = pd.to_datetime(tags["trade_date"])

    trade_scores, day_scores, trade_scores_with_day = build_labels(
        trades, tags, propagate_day_to_trades=True
    )

    trade_scores.to_csv(outdir / "trade_scores.csv", index=False)
    day_scores.to_csv(outdir / "day_scores.csv", index=False)
    trade_scores_with_day.to_csv(outdir / "trade_scores_with_day.csv", index=False)

    print(f"  - trade_scores: {trade_scores.shape}")
    print(f"  - day_scores: {day_scores.shape}")
    print(f"  - trade_scores_with_day: {trade_scores_with_day.shape}")

    # ---------- 5. Preview ----------
    print("\n[5/5] Preview outputs:")
    print("\nTrades head:")
    print(trades.head().to_string(index=False))

    print("\nFeatures head:")
    print(feat.head().to_string(index=False))

    print("\nTags head:")
    print(tags.head().to_string(index=False))

    print("\nTrade scores head:")
    print(trade_scores.head().to_string(index=False))

    print("\nDay scores head:")
    print(day_scores.head().to_string(index=False))

    print("\nTrade scores with day head:")
    print(trade_scores_with_day.head().to_string(index=False))


if __name__ == "__main__":
    main()
