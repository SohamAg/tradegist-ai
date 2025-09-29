from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import json
import os
from pathlib import Path
import sys
import uvicorn
import openai
from dotenv import load_dotenv
import io
from datetime import datetime
import uuid
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# Add the backend app directory to Python path
sys.path.append(str(Path(__file__).parent.parent / "backend" / "app"))

# Import existing modules
from app.ingest import load_ledger, fifo_round_trips
from app.features import compute_features
from app.rules import run_all_rules
from app.labels import build_labels

# Load environment variables
load_dotenv()

app = FastAPI(title="Tradegist AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TradeCreate(BaseModel):
    date: str
    ticker: str
    side: str
    quantity: int
    entry_price: float
    exit_price: Optional[float] = None
    fees: float
    strategy: str
    notes: str
    mood: str
    status: str

class TradeResponse(BaseModel):
    id: str
    date: str
    ticker: str
    side: str
    quantity: int
    entry_price: float
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    fees: float
    strategy: str
    notes: str
    mood: str
    status: str

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    insights: Optional[List[Dict[str, Any]]] = None

class ReportRequest(BaseModel):
    trades: List[Dict[str, Any]]
    behavioralData: Optional[Dict[str, Any]] = None

class AnalyticsResponse(BaseModel):
    performance_data: List[Dict[str, Any]]
    behavioral_insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    metrics: Dict[str, Any]

# Data storage (in production, use a proper database)
trades_db = []
user_id = os.environ.get("TG_USER_ID")

def get_all_trades_from_supabase():
    """Fetch all trades from Supabase for the current user"""
    try:
        import psycopg
        from app.ingest_to_supabase import UID, DB
        
        if not DB:
            print("Database connection not configured")
            return []
        
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                cur.execute("""
                    SELECT trade_id, ticker, side, trade_date, trade_time, qty, 
                           entry_price, exit_price, fees, realized_pnl, strategy, 
                           hold_time_sec, note, mood, manual_tags, screenshot_url
                    FROM public.trades 
                    WHERE user_id = %s 
                    ORDER BY trade_date DESC, trade_id DESC
                """, (UID,))
                
                trades = cur.fetchall()
                
                # Convert to list of dictionaries
                trade_list = []
                for trade in trades:
                    trade_dict = {
                        'trade_id': trade[0],
                        'ticker': trade[1],
                        'side': trade[2],
                        'trade_date': trade[3].isoformat() if trade[3] else None,
                        'trade_time': trade[4].isoformat() if trade[4] else None,
                        'qty': float(trade[5]) if trade[5] else 0,
                        'entry_price': float(trade[6]) if trade[6] else 0,
                        'exit_price': float(trade[7]) if trade[7] else 0,
                        'fees': float(trade[8]) if trade[8] else 0,
                        'realized_pnl': float(trade[9]) if trade[9] else 0,
                        'strategy': trade[10] or '',
                        'hold_time_sec': trade[11],
                        'note': trade[12] or '',
                        'mood': trade[13] or '',
                        'manual_tags': trade[14] or '',
                        'screenshot_url': trade[15] or ''
                    }
                    trade_list.append(trade_dict)
                
                print(f"Fetched {len(trade_list)} trades from Supabase")
                return trade_list
                
    except Exception as e:
        print(f"Error fetching trades from Supabase: {str(e)}")
        return []
    
def compress_scores(csv_path: str, threshold: float = 0.6):
    """
    Read a 'trade_scores_with_day.csv' style file and return a list of:
      { trade_id, trade_date, ticker, tags: [codes with score >= threshold] }

    Notes:
    - Expects numeric scores in [0,1].
    - id columns are detected ('trade_id','trade_date','ticker'); everything else
      that's numeric is treated as a candidate behavior column.
    """
    df = pd.read_csv(csv_path)
    if df.empty:
        return []

    # Identify identifier columns & candidate behavior columns
    id_cols = {"trade_id", "trade_date", "ticker"}
    # Treat non-object dtypes as numeric score columns
    behavior_cols = [c for c in df.columns if c not in id_cols and df[c].dtype != "O"]

    records = []
    for _, r in df.iterrows():
        tags = []
        for c in behavior_cols:
            try:
                val = float(r.get(c, 0))
                if val >= threshold:
                    tags.append(c)
            except Exception:
                pass
        records.append({
            "trade_id": int(r["trade_id"]) if "trade_id" in df.columns and pd.notna(r.get("trade_id")) else None,
            "trade_date": str(r.get("trade_date", "")),
            "ticker": str(r.get("ticker", "")),
            "tags": tags
        })
    return records

def get_behavioral_data_from_supabase():
    """Fetch behavioral data from Supabase for the current user"""
    try:
        import psycopg
        from app.ingest_to_supabase import UID, DB
        
        if not DB:
            print("Database connection not configured")
            return {}
        
        behavioral_data = {}
        
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                # Get trade scores
                cur.execute("""
                    SELECT trade_id, outcome_win, outcome_loss, outcome_breakeven,
                           large_win, large_loss, revenge_immediate, size_inconsistency,
                           follow_through_win_immediate, disciplined_after_loss_immediate,
                           consistent_size
                    FROM public.trade_scores 
                    WHERE user_id = %s
                """, (UID,))
                trade_scores = cur.fetchall()
                behavioral_data['trade_scores'] = [
                    {
                        'trade_id': score[0],
                        'outcome_win': score[1],
                        'outcome_loss': score[2],
                        'outcome_breakeven': score[3],
                        'large_win': score[4],
                        'large_loss': score[5],
                        'revenge_immediate': score[6],
                        'size_inconsistency': score[7],
                        'follow_through_win_immediate': score[8],
                        'disciplined_after_loss_immediate': score[9],
                        'consistent_size': score[10]
                    } for score in trade_scores
                ]
                
                # Get day scores
                cur.execute("""
                    SELECT day, overtrading_day, revenge_day, chop_day,
                           ticker_bias_lifetime, ticker_bias_recent, focused_day,
                           green_day_low_activity
                    FROM public.day_scores 
                    WHERE user_id = %s
                """, (UID,))
                day_scores = cur.fetchall()
                behavioral_data['day_scores'] = [
                    {
                        'day': score[0].isoformat() if score[0] else None,
                        'overtrading_day': score[1],
                        'revenge_day': score[2],
                        'chop_day': score[3],
                        'ticker_bias_lifetime': score[4],
                        'ticker_bias_recent': score[5],
                        'focused_day': score[6],
                        'green_day_low_activity': score[7]
                    } for score in day_scores
                ]
                
                # Get tags
                cur.execute("""
                    SELECT trade_id, tag, confidence
                    FROM public.tags_raw 
                    WHERE user_id = %s
                """, (UID,))
                tags = cur.fetchall()
                behavioral_data['tags'] = [
                    {
                        'trade_id': tag[0],
                        'tag': tag[1],
                        'confidence': tag[2]
                    } for tag in tags
                ]
                
                print(f"Fetched behavioral data: {len(trade_scores)} trade scores, {len(day_scores)} day scores, {len(tags)} tags")
                return behavioral_data
                
    except Exception as e:
        print(f"Error fetching behavioral data from Supabase: {str(e)}")
        return {}

@app.get("/")
async def root():
    return {"message": "Tradegist AI API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Trade endpoints
@app.get("/api/trades", response_model=List[TradeResponse])
async def get_trades():
    """Get all trades for the user"""
    return trades_db

@app.post("/api/trades", response_model=TradeResponse)
async def create_trade(trade: TradeCreate):
    """Create a new trade"""
    trade_id = f"trade_{len(trades_db) + 1}"
    
    # Calculate PnL if exit price is provided
    pnl = None
    if trade.exit_price:
        if trade.side in ["buy", "cover"]:
            pnl = (trade.exit_price - trade.entry_price) * trade.quantity - trade.fees
        else:  # sell, short
            pnl = (trade.entry_price - trade.exit_price) * trade.quantity - trade.fees
    
    trade_response = TradeResponse(
        id=trade_id,
        date=trade.date,
        ticker=trade.ticker,
        side=trade.side,
        quantity=trade.quantity,
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        pnl=pnl,
        fees=trade.fees,
        strategy=trade.strategy,
        notes=trade.notes,
        mood=trade.mood,
        status=trade.status
    )
    
    trades_db.append(trade_response)
    return trade_response

@app.get("/api/trades/{trade_id}", response_model=TradeResponse)
async def get_trade(trade_id: str):
    """Get a specific trade by ID"""
    for trade in trades_db:
        if trade.id == trade_id:
            return trade
    raise HTTPException(status_code=404, detail="Trade not found")

# AI Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatMessage):
    """Chat with AI trading behavior coach"""
    try:
        # ------------------------------------------------------------------
        # 0) Gather DB-backed context (unchanged)
        # ------------------------------------------------------------------
        print("Fetching all trades from Supabase...")
        all_trades_from_db = get_all_trades_from_supabase()
        behavioral_data_from_db = get_behavioral_data_from_supabase()

        # ------------------------------------------------------------------
        # 1) Build context (keep your existing logic, but make it resilient)
        # ------------------------------------------------------------------
        context_info = ""
        ctx = getattr(request, "context", None) or {}

        if ctx:
            selected_trades = ctx.get('selectedTrades', [])
            all_trades = ctx.get('allTrades', [])

            # Selected trades context
            if selected_trades:
                context_info += f"\n\nSELECTED TRADES FOR ANALYSIS ({len(selected_trades)} trades):\n"
                for trade in selected_trades[:10]:  # Show up to 10 selected trades
                    try:
                        context_info += (
                            f"- {trade.get('ticker', 'N/A')} ({trade.get('side', 'N/A')}) "
                            f"on {trade.get('trade_date', 'N/A')}: "
                            f"${float(trade.get('realized_pnl', 0)):.2f} P&L, "
                            f"Mood: {trade.get('mood', 'N/A')}, "
                            f"Tags: {trade.get('manual_tags', 'N/A')}\n"
                        )
                    except Exception:
                        pass

            # Overall trading statistics from Supabase
            if all_trades_from_db:
                total_trades = len(all_trades_from_db)
                winning_trades = len([t for t in all_trades_from_db if (t.get('realized_pnl') or 0) > 0])
                win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
                total_pnl = sum([(t.get('realized_pnl') or 0) for t in all_trades_from_db])
                avg_pnl = total_pnl / total_trades if total_trades > 0 else 0

                context_info += f"\n\nCOMPLETE TRADING HISTORY FROM DATABASE ({total_trades} trades):\n"
                context_info += f"- Total Trades: {total_trades}\n"
                context_info += f"- Win Rate: {win_rate:.1f}%\n"
                context_info += f"- Total P&L: ${total_pnl:.2f}\n"
                context_info += f"- Average P&L per Trade: ${avg_pnl:.2f}\n"

                # Add recent trades summary
                recent_trades = all_trades_from_db[:20]  # Last 20 trades (assumes already sorted desc)
                context_info += f"\n\nRECENT TRADES SUMMARY (Last 20):\n"
                for trade in recent_trades:
                    try:
                        context_info += (
                            f"- {trade.get('ticker', 'N/A')} ({trade.get('side', 'N/A')}) "
                            f"on {trade.get('trade_date', 'N/A')}: "
                            f"${float(trade.get('realized_pnl', 0)):.2f}, "
                            f"Mood: {trade.get('mood', 'N/A')}\n"
                        )
                    except Exception:
                        pass

            # Behavioral insights (from client context)
            insights = ctx.get('insights', [])
            if insights:
                context_info += f"\n\nBEHAVIORAL INSIGHTS:\n"
                for insight in insights[:5]:
                    context_info += f"- {insight}\n"

            # Tag frequency analysis (from client context)
            tag_frequency = ctx.get('tagFrequency', [])
            if tag_frequency:
                context_info += f"\n\nBEHAVIORAL TAG FREQUENCY:\n"
                for tag in tag_frequency[:8]:
                    context_info += f"- {tag.get('tag', 'N/A')}: {tag.get('frequency', 0)} occurrences\n"

            # Mood analysis (from client context)
            mood_analysis = ctx.get('moodAnalysis', {})
            if mood_analysis:
                context_info += f"\n\nMOOD ANALYSIS:\n"
                for mood, data in mood_analysis.items():
                    if isinstance(data, dict) and 'count' in data:
                        avg = data.get('avgPnl', 0) or 0
                        context_info += f"- {mood}: {data.get('count', 0)} trades, Avg P&L: ${float(avg):.2f}\n"

            # Risk metrics (from client context)
            risk_metrics = ctx.get('riskMetrics', {})
            if risk_metrics:
                context_info += f"\n\nRISK METRICS:\n"
                for metric, value in risk_metrics.items():
                    context_info += f"- {metric}: {value}\n"

            # Patterns (from client context)
            patterns = ctx.get('patterns', [])
            if patterns:
                context_info += f"\n\nIDENTIFIED PATTERNS:\n"
                for pattern in patterns[:5]:
                    context_info += f"- {pattern}\n"

            # Behavioral data fetched from DB
            if behavioral_data_from_db:
                context_info += f"\n\nBEHAVIORAL DATA FROM DATABASE:\n"

                # Trade scores analysis
                trade_scores = behavioral_data_from_db.get('trade_scores', [])
                if trade_scores:
                    revenge_trades = len([s for s in trade_scores if (s.get('revenge_immediate') or 0) > 0.5])
                    consistent_trades = len([s for s in trade_scores if (s.get('consistent_size') or 0) > 0.5])
                    disciplined_trades = len([s for s in trade_scores if (s.get('disciplined_after_loss_immediate') or 0) > 0.5])

                    context_info += f"- Trade Scores Analysis ({len(trade_scores)} scored trades):\n"
                    if len(trade_scores) > 0:
                        context_info += f"  * Revenge Trading: {revenge_trades} trades ({revenge_trades/len(trade_scores)*100:.1f}%)\n"
                        context_info += f"  * Consistent Size: {consistent_trades} trades ({consistent_trades/len(trade_scores)*100:.1f}%)\n"
                        context_info += f"  * Disciplined After Loss: {disciplined_trades} trades ({disciplined_trades/len(trade_scores)*100:.1f}%)\n"

                # Day scores analysis
                day_scores = behavioral_data_from_db.get('day_scores', [])
                if day_scores:
                    overtrading_days = len([d for d in day_scores if (d.get('overtrading_day') or 0) > 0.5])
                    focused_days = len([d for d in day_scores if (d.get('focused_day') or 0) > 0.5])

                    context_info += f"- Day Scores Analysis ({len(day_scores)} days):\n"
                    if len(day_scores) > 0:
                        context_info += f"  * Overtrading Days: {overtrading_days} days ({overtrading_days/len(day_scores)*100:.1f}%)\n"
                        context_info += f"  * Focused Days: {focused_days} days ({focused_days/len(day_scores)*100:.1f}%)\n"

                # Raw rule tags (if you store them)
                tags = behavioral_data_from_db.get('tags', [])
                if tags:
                    tag_counts = {}
                    for tag in tags:
                        tag_name = tag.get('tag', 'Unknown')
                        tag_counts[tag_name] = tag_counts.get(tag_name, 0) + 1

                    context_info += f"- Behavioral Tags ({len(tags)} total tags):\n"
                    for tag_name, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                        context_info += f"  * {tag_name}: {count} occurrences\n"

        # ------------------------------------------------------------------
        # 2) Inject CSV context (NEW): raw trades + compressed behavior tags
        # ------------------------------------------------------------------
        try:
            trades_csv_path = "data/trades_roundtrips.csv"
            trades_df = pd.read_csv(trades_csv_path)
            if not trades_df.empty:
                context_info += f"\n\nRAW TRADES FROM CSV ({len(trades_df)} rows):\n"
                for _, r in trades_df.head(10).iterrows():
                    try:
                        context_info += (
                            f"- {r.get('ticker','N/A')} ({str(r.get('side','N/A')).lower()}) "
                            f"on {r.get('trade_date','N/A')}, P&L ${float(r.get('realized_pnl',0) or 0):.2f}, "
                            f"Mood: {r.get('mood','')}, Tags: {r.get('manual_tags','')}\n"
                        )
                    except Exception:
                        pass
        except Exception as e:
            print(f"Could not load trades_roundtrips.csv: {e}")

        try:
            scores_csv_path = "data/trade_scores_with_day.csv"
            compressed = compress_scores(scores_csv_path, threshold=0.6)
            if compressed:
                context_info += f"\n\nBEHAVIORAL TAGS (≥0.6 confidence) FROM SCORES FILE ({len(compressed)} trades):\n"
                for r in compressed[:10]:
                    tags_str = ", ".join(r["tags"]) if r["tags"] else "None"
                    context_info += (
                        f"- {r.get('ticker','')} on {r.get('trade_date','')} "
                        f"(trade_id={r.get('trade_id')}): {tags_str}\n"
                    )
        except Exception as e:
            print(f"Could not load trade_scores_with_day.csv: {e}")

        # ------------------------------------------------------------------
        # 3) Upgraded system prompt (behavior-first, actionable)
        # ------------------------------------------------------------------
        system_prompt = f"""
You are Tradegist, a behavioral analyst and trading coach. Your purpose is to help traders understand the deeper psychological and behavioral drivers of their trading decisions, drawing on both their raw trade history and their behavioral scoring data.

You can use markdown formatting to make your responses more readable and structured. Use:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis  
- `Code blocks` for specific metrics or data
- ## Headers for section organization
- - Bullet points for lists
- > Blockquotes for important insights

STYLE:
- Use markdown formatting to make responses clear and structured
- Write in a conversational, coaching tone
- Organize insights with headers and bullet points for better readability
- Use emphasis and formatting to highlight key points
- Aim for depth: each response should be at least several paragraphs long, weaving together context, insights, and advice.
- Tone: intellectual, insightful, and nuanced, but also warm, supportive, and conversational. The goal is to sound like a mentor who has studied the trader carefully and is speaking to them one-on-one.

CONTEXT INPUT:
1. A CSV of raw trades, including date, ticker, side, size, realized pnl, mood, and any tags. This provides a factual record of what the trader did.
2. A behavioral scores file, where each trade (or day) includes multiple behavioral confidence scores. High-confidence values (for example, >= 0.6) should be interpreted as meaningful tendencies or flags. These scores show when behaviors such as revenge trading, overtrading, inconsistent sizing, or discipline after loss are likely present.

HOW TO USE CONTEXT:
- Refer to specific examples from the trade CSV: e.g. "on October 17, your back-to-back entries in AAPL suggest impatience after a loss."
- Use the behavioral scores file to validate or deepen the interpretation: e.g. "this is supported by your revenge_immediate score being above 0.7 that day."
- Combine both views: show how the raw actions and the statistical tendencies align, diverge, or reinforce each other.
- Surface patterns across time: highlight recurring behaviors (e.g. multiple days flagged for overtrading) or changes (improvement in consistency).
- Place these findings into a narrative that explains what they reveal about the trader’s psychology and habits.

INSTRUCTIONS:
- Always explain the "why" behind each pattern: what it suggests about emotions, mindset, or decision-making under stress.
- Offer forward-looking reflections and coaching: concrete habits, mindsets, or experiments the trader can try to improve discipline.
- Avoid financial recommendations. Focus on behavior, psychology, and discipline.
- Write in a flowing, thoughtful way that encourages self-reflection, not just reporting. The trader should feel like they are reading a careful analysis of themselves written by a coach who has really studied their behavior.

User’s Trading Context:
{context_info}
"""

        # ------------------------------------------------------------------
        # 4) Call OpenAI with the upgraded prompt (unchanged flow)
        # ------------------------------------------------------------------
        api_key = os.getenv("OPEN_AI_KEY")
        if not api_key:
            raise Exception("OpenAI API key not found. Please set OPEN_AI_KEY environment variable.")

        client = openai.OpenAI(api_key=api_key)
        
        # Build conversation messages including history
        conversation_messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:  # Keep last 10 messages to avoid token limits
                conversation_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current user message
        conversation_messages.append({"role": "user", "content": request.message})
        
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=conversation_messages
        )
        ai_response = response.choices[0].message.content

        # ------------------------------------------------------------------
        # 5) Light insight extraction (keep your existing structure)
        # ------------------------------------------------------------------
        insights = []
        low = ai_response.lower()
        if "overtrading" in low or "revenge" in low:
            insights.append({
                "type": "warning",
                "title": "Behavioral Pattern Detected",
                "message": "Focus on emotional control and trading discipline",
                "recommendation": "Consider implementing trading breaks after losses"
            })
        if "improvement" in low or "better" in low:
            insights.append({
                "type": "info",
                "title": "Growth Opportunity",
                "message": "Areas identified for behavioral improvement",
                "recommendation": "Focus on one improvement at a time"
            })

        return ChatResponse(response=ai_response, insights=insights or None)

    except Exception as e:
        print(f"Chat API error: {str(e)}")
        return ChatResponse(
            response="I’m having trouble processing your request right now. Please try again in a moment.",
            insights=None
        )


# Report Generation endpoint
@app.post("/api/generate-report")
async def generate_report(request: ReportRequest):
    """Generate comprehensive trading behavior report"""
    try:
        print(f"Generating report for {len(request.trades)} trades")
        
        # Create PDF buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*inch, bottomMargin=1*inch)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue
        )
        
        # Generate AI-powered report content
        trades = request.trades
        behavioral_data = request.behavioralData or {}
        
        # Calculate basic stats
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.get('realized_pnl', 0) > 0])
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        total_pnl = sum([t.get('realized_pnl', 0) for t in trades])
        avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
        
        print(f"Stats: {total_trades} trades, {win_rate:.1f}% win rate, ${total_pnl:.2f} total P&L")
        
        # Build PDF content
        story = []
        
        # Title
        story.append(Paragraph("Trading Behavior Analysis Report", title_style))
        story.append(Spacer(1, 20))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        story.append(Paragraph(f"""
        This comprehensive report analyzes your trading behavior patterns based on {total_trades} trades. 
        Your current win rate is {win_rate:.1f}%, with a total P&L of ${total_pnl:.2f} and average P&L per trade of ${avg_pnl:.2f}.
        This indicates {'strong' if win_rate > 60 else 'moderate' if win_rate > 40 else 'room for improvement in'} performance consistency.
        """, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Trading Statistics Table
        story.append(Paragraph("Trading Statistics", heading_style))
        stats_data = [
            ['Metric', 'Value'],
            ['Total Trades', str(total_trades)],
            ['Winning Trades', str(winning_trades)],
            ['Losing Trades', str(total_trades - winning_trades)],
            ['Win Rate', f"{win_rate:.1f}%"],
            ['Total P&L', f"${total_pnl:.2f}"],
            ['Average P&L per Trade', f"${avg_pnl:.2f}"],
            ['Best Trade', f"${max([t.get('realized_pnl', 0) for t in trades]):.2f}"],
            ['Worst Trade', f"${min([t.get('realized_pnl', 0) for t in trades]):.2f}"]
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 2*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10)
        ]))
        story.append(stats_table)
        story.append(Spacer(1, 20))
        
        # Behavioral Analysis
        story.append(Paragraph("Behavioral Analysis", heading_style))
        
        # Analyze trading patterns
        analysis_text = f"""
        Based on your trading data, here are the key behavioral patterns identified:
        
        <b>Performance Analysis:</b>
        • Your win rate of {win_rate:.1f}% {'exceeds' if win_rate > 60 else 'meets' if win_rate > 40 else 'falls below'} the typical trader average of 50-60%
        • Average P&L of ${avg_pnl:.2f} per trade suggests {'strong' if avg_pnl > 0 else 'room for improvement in'} position sizing
        • Total P&L of ${total_pnl:.2f} indicates {'profitable' if total_pnl > 0 else 'unprofitable'} trading performance
        
        <b>Risk Management Assessment:</b>
        • {'Good' if abs(min([t.get('realized_pnl', 0) for t in trades])) < abs(avg_pnl) * 2 else 'Poor'} risk management based on worst trade vs average trade ratio
        • {'Consistent' if len(set([t.get('ticker', '') for t in trades])) < total_trades * 0.3 else 'Diversified'} trading approach across tickers
        
        <b>Behavioral Insights:</b>
        • Focus on maintaining discipline during {'winning' if win_rate > 60 else 'losing'} streaks
        • {'Consider' if avg_pnl < 0 else 'Continue'} implementing consistent position sizing rules
        • Track emotional patterns that may impact trading decisions
        """
        
        story.append(Paragraph(analysis_text, styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Recommendations
        story.append(Paragraph("Key Recommendations", heading_style))
        recommendations = [
            "Implement a maximum daily loss limit to prevent emotional trading",
            "Use consistent position sizing based on account size and risk tolerance",
            "Take breaks after consecutive losses to avoid revenge trading",
            "Track mood patterns and their impact on trading decisions",
            "Develop a pre-trade checklist for discipline and consistency",
            "Review and analyze losing trades to identify behavioral patterns",
            "Set realistic profit targets and stick to your trading plan"
        ]
        
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", styles['Normal']))
        
        story.append(Spacer(1, 20))
        
        # Action Plan
        story.append(Paragraph("30-Day Action Plan", heading_style))
        action_plan = f"""
        <b>Week 1:</b> Implement daily loss limits and position sizing rules
        <b>Week 2:</b> Start tracking mood and emotional state before each trade
        <b>Week 3:</b> Review all trades and identify recurring behavioral patterns
        <b>Week 4:</b> Refine your trading plan based on behavioral insights
        
        <b>Success Metrics:</b>
        • Maintain win rate above {max(40, win_rate - 5):.0f}%
        • Keep average loss below ${abs(avg_pnl) * 1.5:.2f}
        • Complete daily trading journal entries
        • Follow pre-trade checklist 100% of the time
        """
        
        story.append(Paragraph(action_plan, styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Footer
        story.append(Paragraph(f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                             ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER)))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        print(f"PDF generated successfully, size: {len(buffer.getvalue())} bytes")
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=trading-behavior-report.pdf"}
        )
        
    except Exception as e:
        print(f"Report generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# Analytics endpoint
@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get comprehensive analytics data"""
    
    # Mock performance data
    performance_data = [
        {"date": "2024-01-01", "pnl": 1200, "trades": 8, "winRate": 75},
        {"date": "2024-01-02", "pnl": -300, "trades": 5, "winRate": 40},
        {"date": "2024-01-03", "pnl": 800, "trades": 6, "winRate": 67},
        {"date": "2024-01-04", "pnl": 1500, "trades": 10, "winRate": 80},
        {"date": "2024-01-05", "pnl": -200, "trades": 4, "winRate": 25},
        {"date": "2024-01-06", "pnl": 2200, "trades": 12, "winRate": 83},
        {"date": "2024-01-07", "pnl": 900, "trades": 7, "winRate": 71},
    ]
    
    behavioral_insights = [
        {
            "type": "warning",
            "title": "Overtrading Pattern",
            "description": "You tend to increase trade frequency after losses",
            "impact": "High",
            "recommendation": "Take breaks after 2 consecutive losses"
        },
        {
            "type": "success",
            "title": "Strong Risk Management", 
            "description": "Excellent position sizing in volatile markets",
            "impact": "Positive",
            "recommendation": "Continue current risk management approach"
        },
        {
            "type": "info",
            "title": "Morning Performance",
            "description": "Your best trades occur between 9:30-11:00 AM",
            "impact": "Medium",
            "recommendation": "Focus trading activity during morning hours"
        }
    ]
    
    recommendations = [
        {
            "category": "Risk Management",
            "title": "Reduce Position Size",
            "description": "Consider reducing position size by 20% during high volatility periods",
            "priority": "High",
            "impact": "Could reduce drawdown by 15%"
        },
        {
            "category": "Strategy Optimization",
            "title": "Focus on Tech Stocks",
            "description": "Your win rate with technology stocks is 15% higher than average",
            "priority": "Medium", 
            "impact": "Potential 25% improvement in returns"
        },
        {
            "category": "Behavioral",
            "title": "Implement Trading Breaks",
            "description": "Take a 30-minute break after any loss exceeding 2% of account",
            "priority": "High",
            "impact": "Reduces emotional trading by 40%"
        }
    ]
    
    metrics = {
        "total_pnl": 12450,
        "win_rate": 68.5,
        "risk_score": "Medium",
        "ai_score": 87,
        "total_trades": len(trades_db),
        "open_positions": len([t for t in trades_db if t.status == "open"])
    }
    
    return AnalyticsResponse(
        performance_data=performance_data,
        behavioral_insights=behavioral_insights,
        recommendations=recommendations,
        metrics=metrics
    )

# Data reset endpoint
@app.post("/api/reset-data")
async def reset_data():
    """Reset all data in Supabase for the current user"""
    try:
        import psycopg
        from app.ingest_to_supabase import UID, DB
        
        if not DB:
            raise HTTPException(status_code=500, detail="Database connection not configured")
        
        print(f"Starting complete data reset for user: {UID}")
        
        with psycopg.connect(DB, autocommit=True) as con:
            with con.cursor() as cur:
                # Clear any prepared statements first
                try:
                    cur.execute("DEALLOCATE ALL")
                except:
                    pass  # Ignore if no prepared statements exist
                
                # Delete all data for the user (in correct order due to foreign keys)
                print("Deleting trade_scores...")
                cur.execute("DELETE FROM public.trade_scores WHERE user_id = %s", (UID,))
                deleted_scores = cur.rowcount
                
                print("Deleting day_scores...")
                cur.execute("DELETE FROM public.day_scores WHERE user_id = %s", (UID,))
                deleted_day_scores = cur.rowcount
                
                print("Deleting tags_raw...")
                cur.execute("DELETE FROM public.tags_raw WHERE user_id = %s", (UID,))
                deleted_tags = cur.rowcount
                
                print("Deleting daily_pnl...")
                cur.execute("DELETE FROM public.daily_pnl WHERE user_id = %s", (UID,))
                deleted_daily = cur.rowcount
                
                print("Deleting trades...")
                cur.execute("DELETE FROM public.trades WHERE user_id = %s", (UID,))
                deleted_trades = cur.rowcount
                
                # Get counts after deletion
                cur.execute("SELECT COUNT(*) FROM public.trades WHERE user_id = %s", (UID,))
                trades_count = cur.fetchone()[0]
                
                print(f"Reset complete. Deleted: {deleted_trades} trades, {deleted_scores} scores, {deleted_tags} tags, {deleted_daily} daily records")
                
        return {
            "message": "Data reset completed successfully",
            "success": True,
            "remaining_trades": trades_count,
            "deleted_counts": {
                "trades": deleted_trades,
                "trade_scores": deleted_scores,
                "day_scores": deleted_day_scores,
                "tags_raw": deleted_tags,
                "daily_pnl": deleted_daily
            }
        }
        
    except Exception as e:
        print(f"Reset failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data reset failed: {str(e)}")

# CSV Import endpoint
@app.post("/api/import-csv")
async def import_csv(file: UploadFile = File(...)):
    """Import CSV file and run full analysis pipeline"""
    tmp_path = None
    try:
        import tempfile
        import shutil
        from app.ingest_to_supabase import main as run_supabase_import
        
        print(f"Starting CSV import for file: {file.filename}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        
        print(f"Saved temporary file to: {tmp_path}")
        
        # First reset existing data
        import psycopg
        from app.ingest_to_supabase import UID, DB
        DB  = os.environ.get("DATABASE_URL")
        UID = os.environ.get("TG_USER_ID")
        
        print(f"Resetting data for user: {UID}")
        
        if DB:
            with psycopg.connect(DB, autocommit=True) as con:
                with con.cursor() as cur:
                    # Clear any prepared statements first
                    try:
                        cur.execute("DEALLOCATE ALL")
                    except:
                        pass  # Ignore if no prepared statements exist
                    
                    # Delete all data for the user (in correct order due to foreign keys)
                    cur.execute("DELETE FROM public.trade_scores WHERE user_id = %s", (UID,))
                    cur.execute("DELETE FROM public.day_scores WHERE user_id = %s", (UID,))
                    cur.execute("DELETE FROM public.tags_raw WHERE user_id = %s", (UID,))
                    cur.execute("DELETE FROM public.daily_pnl WHERE user_id = %s", (UID,))
                    cur.execute("DELETE FROM public.trades WHERE user_id = %s", (UID,))
        
        print("Data reset completed")
        
        # Run the full pipeline
        print("Loading ledger...")
        execs, cash = load_ledger(tmp_path, user_id=user_id)
        print(f"Loaded {len(execs)} executions")
        
        print("Computing FIFO round trips...")
        trades = fifo_round_trips(execs)
        print(f"Generated {len(trades)} trades")
        
        if trades.empty:
            return {"message": "No completed trades found in CSV", "success": False}
        
        # Save processed data to backend/data for Supabase import
        data_dir = Path(__file__).parent / "data"
        data_dir.mkdir(exist_ok=True)
        
        # Save trades
        trades.to_csv(data_dir / "trades_roundtrips.csv", index=False)
        print("Saved trades to CSV")
        
        # Compute features and run analysis
        print("Computing features...")
        feat = compute_features(trades)
        print("Running rules...")
        tags = run_all_rules(feat)
        print(f"Generated {len(tags)} tags")
        
        # Save tags
        if not tags.empty:
            tags.to_csv(data_dir / "tags.csv", index=False)
            print("Saved tags to CSV")
        
        # Build labels and save scores
        print("Building labels...")
        trades["trade_date"] = pd.to_datetime(trades["trade_date"])
        if not tags.empty:
            tags["trade_date"] = pd.to_datetime(tags["trade_date"])
        
        trade_scores, day_scores, trade_scores_with_day = build_labels(trades, tags)
        print(f"Generated {len(trade_scores)} trade scores and {len(day_scores)} day scores")
        
        # Save scores
        if not trade_scores.empty:
            trade_scores.to_csv(data_dir / "trade_scores.csv", index=False)
        if not day_scores.empty:
            day_scores.to_csv(data_dir / "day_scores.csv", index=False)
        print("Saved scores to CSV")
        
        # Import to Supabase
        print("Importing to Supabase...")
        try:
            run_supabase_import()
            supabase_success = True
            print("Supabase import successful")
        except Exception as e:
            print(f"Supabase import failed: {e}")
            supabase_success = False
        
        return {
            "message": "CSV import completed successfully",
            "success": True,
            "trades_count": len(trades),
            "tags_count": len(tags),
            "supabase_imported": supabase_success,
            "trade_scores_count": len(trade_scores) if not trade_scores.empty else 0,
            "day_scores_count": len(day_scores) if not day_scores.empty else 0
        }
        
    except Exception as e:
        print(f"CSV import error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"CSV import failed: {str(e)}")
    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

# Run analysis pipeline
@app.post("/api/analyze")
async def run_analysis():
    """Run the full analysis pipeline on uploaded data"""
    try:
        # Path to mock data
        ledger_path = Path(__file__).parent / "data" / "mock_trades_realistic.csv"
        
        if not os.path.exists(ledger_path):
            raise HTTPException(status_code=404, detail="Mock data file not found")
        
        # Run the pipeline
        execs, cash = load_ledger(ledger_path, user_id=user_id)
        trades = fifo_round_trips(execs)
        
        if trades.empty:
            return {"message": "No completed trades found"}
        
        # Compute features
        feat = compute_features(trades)
        
        # Run rules
        tags = run_all_rules(feat)
        
        # Build labels
        trades["trade_date"] = pd.to_datetime(trades["trade_date"])
        if not tags.empty:
            tags["trade_date"] = pd.to_datetime(tags["trade_date"])
        
        trade_scores, day_scores, trade_scores_with_day = build_labels(trades, tags)
        
        return {
            "message": "Analysis completed successfully",
            "trades_count": len(trades),
            "tags_count": len(tags),
            "trade_scores": trade_scores.to_dict() if not trade_scores.empty else {},
            "day_scores": day_scores.to_dict() if not day_scores.empty else {}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Serve static files (React app) - only if dist directory exists
if os.path.exists("web/dist"):
    app.mount("/static", StaticFiles(directory="web/dist"), name="static")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React app for all non-API routes"""
    if full_path.startswith("api/"):
        return {"error": "API endpoint not found"}
    
    # Serve index.html for all non-API routes (only if dist exists)
    if os.path.exists("web/dist/index.html"):
        return FileResponse("web/dist/index.html")
    else:
        return {"message": "Frontend not built. Please run 'npm run build' in the web directory."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
