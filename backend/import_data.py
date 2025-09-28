#!/usr/bin/env python3
"""
Simple, reliable data import script
"""
import os
import pandas as pd
import psycopg
from pathlib import Path

# Get environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

DB = os.environ.get("DATABASE_URL")
UID = os.environ.get("TG_USER_ID", "36e6fe5b-d920-4cba-9f20-6538ba499327")
DATA_DIR = Path("data")

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

def main():
    print(f"Connecting to DB as UID={UID}")
    
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
    trades_csv = DATA_DIR / "trades_roundtrips.csv"
    if trades_csv.exists():
        df = pd.read_csv(trades_csv)
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
    
    # Import tags
    tags_csv = DATA_DIR / "tags.csv"
    if tags_csv.exists():
        df = pd.read_csv(tags_csv)
        print(f"Importing {len(df)} tags...")
        
        inserted = 0
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                for _, r in df.iterrows():
                    try:
                        trade_id = None
                        if not pd.isna(r.get("trade_id")) and str(r.get("trade_id")).strip() != "":
                            csv_trade_id = int(r["trade_id"])
                            trade_id = trade_mapping.get(csv_trade_id)
                            if trade_id is None:
                                continue
                        
                        cur.execute("""
                          insert into public.tags_raw
                          (user_id, trade_id, trade_date, tag, confidence, rationale, scope, source)
                          values (%s,%s,%s,%s,%s,%s,%s,%s)
                        """, (
                          UID,
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
                        continue
        
        print(f"Imported {inserted} tags")
    
    # Import trade scores
    scores_csv = DATA_DIR / "trade_scores.csv"
    if scores_csv.exists():
        df = pd.read_csv(scores_csv).fillna(0.0)
        cols = [c for c in df.columns if c not in ("user_id","trade_id","trade_date","ticker")]
        print(f"Importing {len(df)} trade scores...")
        
        inserted = 0
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                for _, r in df.iterrows():
                    try:
                        if pd.isna(r.get("trade_id")) or str(r.get("trade_id")).strip() == "":
                            continue
                        
                        csv_trade_id = int(r["trade_id"])
                        trade_id = trade_mapping.get(csv_trade_id)
                        if trade_id is None:
                            continue
                        
                        cur.execute(f"""
                          insert into public.trade_scores (user_id, trade_id, trade_date, ticker, {",".join(cols)})
                          values (%s,%s,%s,%s, {",".join(['%s']*len(cols))})
                        """, (
                          UID,
                          trade_id,
                          pd.to_datetime(r["trade_date"]).date(),
                          str(r["ticker"]),
                          *[safe_float(r[c]) for c in cols]
                        ))
                        inserted += 1
                    except Exception as e:
                        continue
        
        print(f"Imported {inserted} trade scores")
    
    # Import day scores
    day_scores_csv = DATA_DIR / "day_scores.csv"
    if day_scores_csv.exists():
        df = pd.read_csv(day_scores_csv).fillna(0.0)
        cols = [c for c in df.columns if c not in ("user_id","trade_date")]
        print(f"Importing {len(df)} day scores...")
        
        inserted = 0
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                for _, r in df.iterrows():
                    try:
                        cur.execute(f"""
                          insert into public.day_scores (user_id, trade_date, {",".join(cols)})
                          values (%s,%s, {",".join(['%s']*len(cols))})
                        """, (
                          UID,
                          pd.to_datetime(r["trade_date"]).date(),
                          *[safe_float(r[c]) for c in cols]
                        ))
                        inserted += 1
                    except Exception as e:
                        continue
        
        print(f"Imported {inserted} day scores")
    
    # Final check
    with psycopg.connect(DB, autocommit=True) as con:
        with con.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.trades WHERE user_id = %s", (UID,))
            final_trades = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM public.tags_raw WHERE user_id = %s", (UID,))
            final_tags = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM public.trade_scores WHERE user_id = %s", (UID,))
            final_scores = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM public.day_scores WHERE user_id = %s", (UID,))
            final_day_scores = cur.fetchone()[0]
    
    print("\n=== FINAL RESULTS ===")
    print(f"Trades: {final_trades}")
    print(f"Tags: {final_tags}")
    print(f"Trade Scores: {final_scores}")
    print(f"Day Scores: {final_day_scores}")
    print("\n✅ Data import complete! Everything should now be visible in your app.")

if __name__ == "__main__":
    main()

