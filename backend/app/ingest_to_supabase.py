# backend/scripts/write_supabase_test.py
# Purpose: backend-only test writer to Supabase (no API endpoint yet).
# Reads CSVs from backend/data and inserts into your schema.

import os
from pathlib import Path
from datetime import datetime
import pandas as pd
import psycopg
import time

# Optional: load backend/.env if present
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
except Exception:
    pass

DB  = os.environ.get("DATABASE_URL")
UID = os.environ.get("TG_USER_ID")  # your fixed UUID

# Get the script directory and resolve paths relative to project root
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
TRADES_CSV = DATA_DIR / "trades_roundtrips.csv"   # REQUIRED
TAGS_CSV   = DATA_DIR / "tags.csv"                # optional
TSCORES_CSV= DATA_DIR / "trade_scores.csv"        # optional
DSCORES_CSV= DATA_DIR / "day_scores.csv"          # optional

def safe_float(v, default=0.0):
    try:
        if v is None:
            return default
        if isinstance(v, float) and pd.isna(v):
            return default
        if isinstance(v, str) and not v.strip():
            return default
        return float(v)
    except Exception:
        return default

def require_env():
    if not DB:
        raise RuntimeError("DATABASE_URL not set")
    if not UID:
        raise RuntimeError("TG_USER_ID not set (your fixed UUID)")

def upsert_daily(cur, user_id, account_id, day, realized):
    cur.execute("""
      insert into public.daily_pnl (user_id, account_id, day, realized_pnl)
      values (%s,%s,%s,%s)
      on conflict (user_id, account_id, day)
      do update set realized_pnl = public.daily_pnl.realized_pnl + excluded.realized_pnl
    """, (user_id, account_id, day, realized))

def write_trades(con):
    if not TRADES_CSV.exists():
        raise FileNotFoundError(f"Missing required file: {TRADES_CSV}")

    df = pd.read_csv(TRADES_CSV)
    needed = ["trade_date","ticker","side","qty","entry_price","exit_price","realized_pnl"]
    for c in needed:
        if c not in df.columns:
            raise ValueError(f"trades_roundtrips.csv missing column: {c}")

    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            day = pd.to_datetime(r["trade_date"]).date()
            cur.execute("""
              insert into public.trades
              (user_id, account_id, ticker, side, trade_date, trade_time, qty, entry_price, exit_price, fees, realized_pnl,
               strategy, hold_time_sec, note, mood, manual_tags, screenshot_url)
              values (%s, gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s,
                      %s, %s, %s, %s, %s, %s)
              returning trade_id, account_id
            """, (
              UID,
              r["ticker"], str(r["side"]).lower(),
              day,
              None,  # set if your CSV has a parseable trade_time
              safe_float(r["qty"]),
              safe_float(r["entry_price"]),
              safe_float(r["exit_price"]),
              safe_float(r.get("fees", 0)),
              safe_float(r["realized_pnl"]),
              str(r.get("strategy","")) or "",
              None if pd.isna(r.get("hold_time_sec", None)) else safe_float(r.get("hold_time_sec")),
              str(r.get("note","")) or "",
              str(r.get("mood","")) or "",
              str(r.get("manual_tags","")) or "",
              str(r.get("screenshot_url","")) or "",
            ))
            trade_id, account_id = cur.fetchone()
            upsert_daily(cur, UID, account_id, day, safe_float(r["realized_pnl"]))
            inserted += 1
    return inserted

def get_trade_id_mapping(con):
    """Get mapping from CSV trade_id to actual database trade_id"""
    with con.cursor() as cur:
        cur.execute("""
            SELECT trade_id, ticker, trade_date, side, qty, entry_price, exit_price
            FROM public.trades 
            WHERE user_id = %s 
            ORDER BY trade_id
        """, (UID,))
        trades = cur.fetchall()
        
        # Create mapping based on position/index
        trade_mapping = {}
        for i, trade in enumerate(trades):
            csv_trade_id = i + 1  # CSV uses 1-based indexing
            db_trade_id = trade[0]  # Database trade_id
            trade_mapping[csv_trade_id] = db_trade_id
        
        return trade_mapping

def write_tags_raw(con):
    if not TAGS_CSV.exists():
        print(f"Tags CSV not found: {TAGS_CSV}")
        return 0
    df = pd.read_csv(TAGS_CSV)
    if df.empty:
        print("Tags CSV is empty")
        return 0
    
    # Get trade ID mapping
    trade_mapping = get_trade_id_mapping(con)
    
    print(f"Processing {len(df)} behavioral tags...")
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            try:
                # Handle trade_id - map CSV trade_id to database trade_id
                trade_id = None
                if not pd.isna(r.get("trade_id")) and str(r.get("trade_id")).strip() != "":
                    csv_trade_id = int(r["trade_id"])
                    trade_id = trade_mapping.get(csv_trade_id)
                    if trade_id is None:
                        print(f"Warning: No database trade_id found for CSV trade_id {csv_trade_id}")
                        continue
                
                cur.execute("""
                  insert into public.tags_raw
                  (user_id, trade_id, trade_date, tag, confidence, rationale, scope, source)
                  values (%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                  UID,  # Always use the environment user_id
                  trade_id,
                  pd.to_datetime(r["trade_date"]).date(),
                  str(r["tag"]),
                  safe_float(r.get("confidence", 1.0), 1.0),
                  str(r.get("rationale","")) or "",
                  str(r.get("scope","trade")),
                  str(r.get("source","rule"))
                ))
                inserted += 1
            except Exception as e:
                print(f"Error inserting tag {r.get('tag', 'unknown')}: {e}")
                continue
    print(f"Inserted {inserted} behavioral tags")
    return inserted

def write_trade_scores(con):
    if not TSCORES_CSV.exists():
        print(f"Trade scores CSV not found: {TSCORES_CSV}")
        return 0
    df = pd.read_csv(TSCORES_CSV).fillna(0.0)
    if df.empty:
        print("Trade scores CSV is empty")
        return 0
    
    # Get trade ID mapping
    trade_mapping = get_trade_id_mapping(con)
    
    cols = [c for c in df.columns if c not in ("user_id","trade_id","trade_date","ticker")]
    print(f"Processing {len(df)} trade scores with columns: {cols}")
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            try:
                # Handle trade_id - map CSV trade_id to database trade_id
                if pd.isna(r.get("trade_id")) or str(r.get("trade_id")).strip() == "":
                    print(f"Skipping trade score with missing trade_id")
                    continue
                
                csv_trade_id = int(r["trade_id"])
                trade_id = trade_mapping.get(csv_trade_id)
                if trade_id is None:
                    print(f"Warning: No database trade_id found for CSV trade_id {csv_trade_id}")
                    continue
                
                cur.execute(f"""
                  insert into public.trade_scores (user_id, trade_id, trade_date, ticker, {",".join(cols)})
                  values (%s,%s,%s,%s, {",".join(['%s']*len(cols))})
                """, (
                  UID,  # Always use the environment user_id
                  trade_id,
                  pd.to_datetime(r["trade_date"]).date(),
                  str(r["ticker"]),
                  *[safe_float(r[c]) for c in cols]
                ))
                inserted += 1
            except Exception as e:
                print(f"Error inserting trade score for trade_id {r.get('trade_id', 'unknown')}: {e}")
                continue
    print(f"Inserted {inserted} trade scores")
    return inserted

def write_day_scores(con):
    if not DSCORES_CSV.exists():
        print(f"Day scores CSV not found: {DSCORES_CSV}")
        return 0
    df = pd.read_csv(DSCORES_CSV).fillna(0.0)
    if df.empty:
        print("Day scores CSV is empty")
        return 0
    
    cols = [c for c in df.columns if c not in ("user_id","trade_date")]
    print(f"Processing {len(df)} day scores with columns: {cols}")
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            try:
                cur.execute(f"""
                  insert into public.day_scores (user_id, trade_date, {",".join(cols)})
                  values (%s,%s, {",".join(['%s']*len(cols))})
                """, (
                  UID,  # Always use the environment user_id
                  pd.to_datetime(r["trade_date"]).date(),
                  *[safe_float(r[c]) for c in cols]
                ))
                inserted += 1
            except Exception as e:
                print(f"Error inserting day score for date {r.get('trade_date', 'unknown')}: {e}")
                continue
    print(f"Inserted {inserted} day scores")
    return inserted

def sanity_checks(con):
    with con.cursor() as cur:
        cur.execute("select coalesce(sum(realized_pnl),0) from public.trades where user_id=%s", (UID,))
        total_pnl, = cur.fetchone()

        cur.execute("select count(*) from public.trades where user_id=%s", (UID,))
        total_trades, = cur.fetchone()

        cur.execute("""
          select user_id, day, realized_pnl
          from public.v_daily_series
          where user_id=%s
          order by day desc limit 5
        """, (UID,))
        recent_days = [{"user_id": r[0], "day": str(r[1]), "pnl": float(r[2])} for r in cur.fetchall()]

    return {
        "sum_realized_pnl_in_trades": float(total_pnl),
        "trade_count": int(total_trades),
        "recent_daily_rows": recent_days
    }

def clear_all_data():
    """Clear ALL data for the user to allow fresh import"""
    print("Clearing ALL data...")
    with psycopg.connect(DB, autocommit=True) as con:
        with con.cursor() as cur:
            # Clear in reverse dependency order
            cur.execute("DELETE FROM public.tags_raw WHERE user_id = %s", (UID,))
            tags_deleted = cur.rowcount
            print(f"Deleted {tags_deleted} tags")
            
            cur.execute("DELETE FROM public.trade_scores WHERE user_id = %s", (UID,))
            scores_deleted = cur.rowcount
            print(f"Deleted {scores_deleted} trade scores")
            
            cur.execute("DELETE FROM public.day_scores WHERE user_id = %s", (UID,))
            day_scores_deleted = cur.rowcount
            print(f"Deleted {day_scores_deleted} day scores")
            
            cur.execute("DELETE FROM public.daily_pnl WHERE user_id = %s", (UID,))
            daily_pnl_deleted = cur.rowcount
            print(f"Deleted {daily_pnl_deleted} daily pnl records")
            
            cur.execute("DELETE FROM public.trades WHERE user_id = %s", (UID,))
            trades_deleted = cur.rowcount
            print(f"Deleted {trades_deleted} trades")
            
            return {"tags": tags_deleted, "trade_scores": scores_deleted, "day_scores": day_scores_deleted, "daily_pnl": daily_pnl_deleted, "trades": trades_deleted}

def main():
    require_env()
    print(f"Connecting to DB as UID={UID}")
    print(f"Looking for files in: {DATA_DIR}")
    print(f"Trades CSV: {TRADES_CSV} (exists: {TRADES_CSV.exists()})")
    print(f"Tags CSV: {TAGS_CSV} (exists: {TAGS_CSV.exists()})")
    print(f"Trade Scores CSV: {TSCORES_CSV} (exists: {TSCORES_CSV.exists()})")
    print(f"Day Scores CSV: {DSCORES_CSV} (exists: {DSCORES_CSV.exists()})")
    
    # Use the reliable import logic directly
    print("\n🔄 Running reliable data import...")
    
    # Clear all data
    print("Clearing all data...")
    with psycopg.connect(DB, autocommit=True) as con:
        with con.cursor() as cur:
            cur.execute("DELETE FROM public.tags_raw WHERE user_id = %s", (UID,))
            print(f"Deleted {cur.rowcount} tags")
            
            cur.execute("DELETE FROM public.trade_scores WHERE user_id = %s", (UID,))
            print(f"Deleted {cur.rowcount} trade scores")
            
            cur.execute("DELETE FROM public.day_scores WHERE user_id = %s", (UID,))
            print(f"Deleted {cur.rowcount} day scores")
            
            cur.execute("DELETE FROM public.daily_pnl WHERE user_id = %s", (UID,))
            print(f"Deleted {cur.rowcount} daily pnl records")
            
            cur.execute("DELETE FROM public.trades WHERE user_id = %s", (UID,))
            print(f"Deleted {cur.rowcount} trades")
    
    # Import trades
    if TRADES_CSV.exists():
        df = pd.read_csv(TRADES_CSV)
        print(f"Importing {len(df)} trades...")
        
        inserted = 0
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                for _, r in df.iterrows():
                    try:
                        day = pd.to_datetime(r["trade_date"]).date()
                        cur.execute("""
                          insert into public.trades
                          (user_id, account_id, ticker, side, trade_date, trade_time, qty, entry_price, exit_price, fees, realized_pnl,
                           strategy, hold_time_sec, note, mood, manual_tags, screenshot_url)
                          values (%s, gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s,
                                  %s, %s, %s, %s, %s, %s)
                          returning trade_id, account_id
                        """, (
                          UID,
                          r["ticker"], str(r["side"]).lower(),
                          day,
                          None,  # trade_time
                          safe_float(r["qty"]),
                          safe_float(r["entry_price"]),
                          safe_float(r["exit_price"]),
                          safe_float(r.get("fees", 0)),
                          safe_float(r["realized_pnl"]),
                          str(r.get("strategy","")) or "",
                          None if pd.isna(r.get("hold_time_sec", None)) else safe_float(r.get("hold_time_sec")),
                          str(r.get("note","")) or "",
                          str(r.get("mood","")) or "",
                          str(r.get("manual_tags","")) or "",
                          str(r.get("screenshot_url","")) or "",
                        ))
                        trade_id, account_id = cur.fetchone()
                        
                        # Update daily PnL
                        cur.execute("""
                          insert into public.daily_pnl (user_id, account_id, day, realized_pnl)
                          values (%s,%s,%s,%s)
                          on conflict (user_id, account_id, day)
                          do update set realized_pnl = public.daily_pnl.realized_pnl + excluded.realized_pnl
                        """, (UID, account_id, day, safe_float(r["realized_pnl"])))
                        
                        inserted += 1
                    except Exception as e:
                        print(f"Error inserting trade {r.get('ticker', 'unknown')}: {e}")
                        continue
        
        print(f"Imported {inserted} trades")
    
    # Get trade mapping for behavioral data
    with psycopg.connect(DB, autocommit=True) as con:
        with con.cursor() as cur:
            cur.execute("SELECT trade_id FROM public.trades WHERE user_id = %s ORDER BY trade_id", (UID,))
            trades = cur.fetchall()
            trade_mapping = {i+1: trade[0] for i, trade in enumerate(trades)}
    
    print(f"Trade mapping: {len(trade_mapping)} trades")
    
    # Import behavioral data using the existing functions
    with psycopg.connect(DB, autocommit=True) as con:
        c2 = write_tags_raw(con)
    
    with psycopg.connect(DB, autocommit=True) as con:
        c3 = write_trade_scores(con)
    
    with psycopg.connect(DB, autocommit=True) as con:
        c4 = write_day_scores(con)
    
    # Final check
    with psycopg.connect(DB, autocommit=True) as con:
        checks = sanity_checks(con)

    print("\n=== FINAL RESULTS ===")
    print(f"Trades: {len(trade_mapping)}")
    print(f"Tags: {c2}")
    print(f"Trade Scores: {c3}")
    print(f"Day Scores: {c4}")
    print("Final state:", checks)
    print("\n✅ Data import complete! Everything should now be visible in your app.")

if __name__ == "__main__":
    main()
