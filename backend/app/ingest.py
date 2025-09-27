"""
Ingest a minimal ledger and produce:
1) Trades (round-trip)  2) CashEvents

INPUT columns (case-insensitive): date, ticker, action, quantity, price, amount
- 'action' determines the row type:
  - trades:    contains one of ["buy","sell","short","cover"]
  - deposit:   contains "deposit"
  - withdraw:  contains "withdraw"
  - fee:       contains "fee", "commission"
  - interest:  contains "interest"
Notes:
- For non-trades, quantity/price can be empty.
- For trades, we use FIFO lot matching to reconstruct round-trips (long/short).
"""

import argparse
import pandas as pd
import numpy as np
from collections import deque
from typing import Tuple

# ---------- Canonical outputs ----------

TRADES_COLS = [
    "trade_id","user_id","trade_date","trade_time","ticker","side","qty",
    "entry_price","exit_price","fees","realized_pnl",
    "strategy","hold_time_sec","note","mood","manual_tags","screenshot_url"
]

CASHEVENTS_COLS = [
    "event_id","user_id","date","event_type","amount","note"
]

# ---------- Helpers ----------

def _pick(df: pd.DataFrame, name_candidates) -> str:
    """Return the first column from df whose lowercased name matches any candidate."""
    lower = {c.lower(): c for c in df.columns}
    for cand in name_candidates:
        if cand.lower() in lower:
            return lower[cand.lower()]
    raise KeyError(f"Missing required column (tried {name_candidates})")

def _classify_action(action: str) -> Tuple[str, str]:
    """
    Classify raw action text into (row_type, trade_dir)
    row_type ∈ {"trade","deposit","withdraw","fee","interest","ignore"}
    trade_dir ∈ {"buy","sell","short","cover",""} (only when row_type=="trade")
    """
    a = (action or "").strip().lower()
    # Cash events first
    if "deposit" in a:  return ("deposit","")
    if "withdraw" in a or "withdrawal" in a: return ("withdraw","")
    if "interest" in a: return ("interest","")
    if "fee" in a or "commission" in a: return ("fee","")
    # Trades
    if "sell short" in a or ("short" in a and "cover" not in a):
        return ("trade","short")
    if "buy to cover" in a or "cover" in a:
        return ("trade","cover")
    if "buy" in a:
        return ("trade","buy")
    if "sell" in a:
        return ("trade","sell")
    # Unknown/unhandled -> ignore (safe)
    return ("ignore","")

def load_ledger(path: str, user_id: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Read raw CSV/XLSX and split into:
      executions_df: rows that are trades with normalized fields
      cash_df:       rows that are deposits/withdrawals/fees/interest
    """
    df = pd.read_csv(path) if path.lower().endswith(".csv") else pd.read_excel(path)

    c_date   = _pick(df, ["date"])
    c_ticker = _pick(df, ["ticker","symbol"])
    c_action = _pick(df, ["action", "description"])
    c_qty    = _pick(df, ["quantity","qty","shares","contracts"])
    c_price  = _pick(df, ["price"])
    c_amount = _pick(df, ["amount","cash","net"])

    # Basic normalization
    norm = pd.DataFrame()
    norm["user_id"] = user_id
    norm["date"]    = pd.to_datetime(df[c_date], errors="coerce").dt.date
    norm["ticker"]  = df[c_ticker].astype(str).str.upper().str.strip()
    norm["action_raw"] = df[c_action].astype(str)

    # Classify row type
    norm[["row_type","trade_dir"]] = norm["action_raw"].apply(
        lambda s: pd.Series(_classify_action(s))
    )

    # Numeric fields (may be NaN for non-trades)
    norm["quantity"] = pd.to_numeric(df[c_qty], errors="coerce")
    norm["price"]    = pd.to_numeric(df[c_price], errors="coerce")
    norm["amount"]   = pd.to_numeric(df[c_amount], errors="coerce")

    # Cash events table
    cash_df = norm[norm["row_type"].isin(["deposit","withdraw","fee","interest"])].copy()
    cash_df = cash_df.assign(
        event_type=cash_df["row_type"],
        note=cash_df["action_raw"].astype(str).str.strip()
    )[["user_id","date","event_type","amount","note"]].reset_index(drop=True)
    cash_df.insert(0, "event_id", np.arange(1, len(cash_df)+1, dtype=int))

    # Executions (trades) table
    exec_df = norm[norm["row_type"]=="trade"].copy()
    # Signed qty: buy/cover positive; sell/short negative
    sign = np.where(exec_df["trade_dir"].isin(["buy","cover"]), 1.0, -1.0)
    exec_df["qty_signed"] = sign * exec_df["quantity"].fillna(0.0).astype(float)
    exec_df["price"] = exec_df["price"].fillna(0.0).astype(float)

    exec_df = exec_df[["user_id","date","ticker","trade_dir","qty_signed","price"]]
    exec_df = exec_df.sort_values(["user_id","ticker","date"]).reset_index(drop=True)
    return exec_df, cash_df

def fifo_round_trips(execs: pd.DataFrame) -> pd.DataFrame:
    """
    Convert trade executions into round-trip trades using FIFO lot matching.
    - BUY closes shorts first, else opens longs
    - SELL closes longs first, else opens shorts
    - COVER closes shorts
    - SHORT opens shorts
    No intraday time provided, so 'trade_time' is NaT and 'hold_time_sec' is NaN.
    Fees are unknown here -> set to 0; fee rows live in CashEvents.
    """
    out_rows = []
    for (user, tkr), sub in execs.groupby(["user_id","ticker"], sort=False):
        # Lots: (qty_remaining, entry_price, entry_date)
        long_lots  = deque()   # qty > 0
        short_lots = deque()   # qty < 0 (store negative for clarity)

        for _, r in sub.iterrows():
            d = r["trade_dir"]; qabs = abs(float(r["qty_signed"])); px = float(r["price"]); dt = r["date"]

            if d in ("buy","cover"):
                # close shorts first
                while qabs > 1e-9 and short_lots:
                    lot_qty, lot_px, lot_dt = short_lots[0]  # negative
                    lot_rem = abs(lot_qty)
                    used = min(qabs, lot_rem)
                    pnl = (lot_px - px) * used  # short profit if exit lower
                    out_rows.append(dict(
                        user_id=user, trade_date=dt, trade_time=pd.NaT, ticker=tkr,
                        side="short", qty=used, entry_price=lot_px, exit_price=px,
                        fees=0.0, realized_pnl=pnl,
                        strategy="", hold_time_sec=np.nan, note="", mood="",
                        manual_tags="", screenshot_url=""
                    ))
                    qabs -= used
                    remaining = lot_rem - used
                    if remaining <= 1e-9:
                        short_lots.popleft()
                    else:
                        short_lots[0] = (-remaining, lot_px, lot_dt)
                # leftover opens/extends long
                if qabs > 1e-9:
                    long_lots.append((qabs, px, dt))

            elif d in ("sell","short"):
                # close longs first
                while qabs > 1e-9 and long_lots:
                    lot_qty, lot_px, lot_dt = long_lots[0]  # positive
                    used = min(qabs, lot_qty)
                    pnl = (px - lot_px) * used  # long profit if exit higher
                    out_rows.append(dict(
                        user_id=user, trade_date=dt, trade_time=pd.NaT, ticker=tkr,
                        side="long", qty=used, entry_price=lot_px, exit_price=px,
                        fees=0.0, realized_pnl=pnl,
                        strategy="", hold_time_sec=np.nan, note="", mood="",
                        manual_tags="", screenshot_url=""
                    ))
                    qabs -= used
                    remaining = lot_qty - used
                    if remaining <= 1e-9:
                        long_lots.popleft()
                    else:
                        long_lots[0] = (remaining, lot_px, lot_dt)
                # leftover sells open/extend short
                if qabs > 1e-9:
                    short_lots.append((-qabs, px, dt))

    trades = pd.DataFrame(out_rows)
    if trades.empty:
        return pd.DataFrame(columns=TRADES_COLS)

    trades = trades.sort_values(["user_id","trade_date","ticker"]).reset_index(drop=True)
    trades.insert(0, "trade_id", np.arange(1, len(trades)+1, dtype=int))
    # Ensure canonical order
    for col in TRADES_COLS:
        if col not in trades.columns:
            trades[col] = "" if col not in ("fees","realized_pnl","qty","entry_price","exit_price","hold_time_sec") else 0.0
    return trades[TRADES_COLS]

def main():
    ap = argparse.ArgumentParser(description="Ingest minimal ledger (date,ticker,action,quantity,price,amount).")
    ap.add_argument("path", help="CSV/XLSX path")
    ap.add_argument("--user", default="demo_user", help="user_id to attach")
    ap.add_argument("--save-trades", default=None, help="optional CSV path to save round-trip trades")
    ap.add_argument("--save-cash", default=None, help="optional CSV path to save cash events")
    args = ap.parse_args()

    execs, cash = load_ledger(args.path, user_id=args.user)
    trades = fifo_round_trips(execs)

    print("\n=== Round-Trip Trades (top 10) ===")
    print(trades.head(10).to_string(index=False))
    print(f"\nCompleted trades: {len(trades)}")

    print("\n=== Cash Events (top 10) ===")
    print(cash.head(10).to_string(index=False))
    print(f"\nCash events: {len(cash)}")

    if args.save_trades:
        trades.to_csv(args.save_trades, index=False)
        print(f"Saved trades → {args.save_trades}")
    if args.save_cash:
        cash.to_csv(args.save_cash, index=False)
        print(f"Saved cash events → {args.save_cash}")

if __name__ == "__main__":
    main()
