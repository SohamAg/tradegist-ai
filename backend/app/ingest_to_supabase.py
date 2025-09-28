# backend/scripts/write_supabase_test.py
# Purpose: backend-only test writer to Supabase (no API endpoint yet).
# Reads CSVs from backend/data and inserts into your schema.

import os
from pathlib import Path
from datetime import datetime
import pandas as pd
import psycopg

# Optional: load backend/.env if present
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
except Exception:
    pass

DB  = os.environ.get("DATABASE_URL")
UID = os.environ.get("TG_USER_ID")  # your fixed UUID
ACCOUNT_ID = os.environ.get("TG_ACCOUNT_ID") or UID  # single account for now

DATA_DIR    = Path("backend/data")
TRADES_CSV  = DATA_DIR / "trades_roundtrips.csv"
TAGS_CSV    = DATA_DIR / "tags.csv"
TSCORES_CSV = DATA_DIR / "trade_scores.csv"
DSCORES_CSV = DATA_DIR / "day_scores.csv"


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
              values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                      %s,%s,%s,%s,%s,%s)
              on conflict (user_id, ticker, trade_date, side, qty, entry_price, exit_price)
              do update set
                fees = excluded.fees,
                realized_pnl = excluded.realized_pnl,
                trade_time = excluded.trade_time,
                strategy = excluded.strategy,
                hold_time_sec = excluded.hold_time_sec,
                note = excluded.note,
                mood = excluded.mood,
                manual_tags = excluded.manual_tags,
                screenshot_url = excluded.screenshot_url
              returning trade_id, account_id
            """, (
              UID, ACCOUNT_ID,
              r["ticker"], str(r["side"]).lower(),
              day,
              None,
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


def write_tags_raw(con):
    if not TAGS_CSV.exists():
        return 0
    df = pd.read_csv(TAGS_CSV)
    if df.empty:
        return 0
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            cur.execute("""
              insert into public.tags_raw
              (user_id, trade_id, trade_date, tag, confidence, rationale, scope, source)
              values (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
              UID,
              None if pd.isna(r.get("trade_id")) else int(r["trade_id"]),
              pd.to_datetime(r["trade_date"]).date(),
              r["tag"],
              safe_float(r.get("confidence", 1.0), 1.0),
              str(r.get("rationale","")) or "",
              str(r.get("scope","trade")),
              str(r.get("source","rule"))
            ))
            inserted += 1
    return inserted


def write_trade_scores(con):
    if not TSCORES_CSV.exists():
        return 0
    df = pd.read_csv(TSCORES_CSV).fillna(0.0)
    if df.empty:
        return 0
    cols = [c for c in df.columns if c not in ("user_id","trade_id","trade_date","ticker")]
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            trade_id = None if pd.isna(r.get("trade_id")) else int(r["trade_id"])
            if not trade_id:
                continue  # TODO: resolve via natural key if trade_id missing

            cur.execute(f"""
              insert into public.trade_scores (user_id, trade_id, trade_date, ticker, {",".join(cols)})
              values (%s,%s,%s,%s, {",".join(['%s']*len(cols))})
              on conflict (user_id, trade_id)
              do update set {",".join([f"{c}=excluded.{c}" for c in cols])}
            """, (
              UID,
              trade_id,
              pd.to_datetime(r["trade_date"]).date(),
              r["ticker"],
              *[safe_float(r[c]) for c in cols]
            ))
            inserted += 1
    return inserted


def write_day_scores(con):
    if not DSCORES_CSV.exists():
        return 0
    df = pd.read_csv(DSCORES_CSV).fillna(0.0)
    if df.empty:
        return 0
    cols = [c for c in df.columns if c not in ("user_id","trade_date")]
    inserted = 0
    with con.cursor() as cur:
        for _, r in df.iterrows():
            cur.execute(f"""
              insert into public.day_scores (user_id, trade_date, {",".join(cols)})
              values (%s,%s, {",".join(['%s']*len(cols))})
              on conflict (user_id, trade_date)
              do update set {",".join([f"{c}=excluded.{c}" for c in cols])}
            """, (
              UID,
              pd.to_datetime(r["trade_date"]).date(),
              *[safe_float(r[c]) for c in cols]
            ))
            inserted += 1
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


def main():
    require_env()
    print(f"Connecting to DB as UID={UID}")
    with psycopg.connect(DB, autocommit=True) as con:
        c1 = write_trades(con)
        c2 = write_tags_raw(con)
        c3 = write_trade_scores(con)
        c4 = write_day_scores(con)
        checks = sanity_checks(con)

    print("== Insert counts ==")
    print({"trades": c1, "tags_raw": c2, "trade_scores": c3, "day_scores": c4})
    print("== Sanity checks ==")
    print(checks)


if __name__ == "__main__":
    main()
