from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import json
import os
from pathlib import Path
import sys

# Add the backend app directory to Python path
sys.path.append(str(Path(__file__).parent.parent / "backend" / "app"))

# Import existing modules
from ingest import load_ledger, fifo_round_trips
from features import compute_features
from rules import run_all_rules
from labels import build_labels

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
    user_id: str = "demo_user"

class ChatResponse(BaseModel):
    response: str
    insights: Optional[List[Dict[str, Any]]] = None

class AnalyticsResponse(BaseModel):
    performance_data: List[Dict[str, Any]]
    behavioral_insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    metrics: Dict[str, Any]

# Data storage (in production, use a proper database)
trades_db = []
user_id = "demo_user"

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
async def chat_with_ai(message: ChatMessage):
    """Chat with AI assistant"""
    user_message = message.message.lower()
    
    # Simple AI responses based on keywords
    if "analyze" in user_message or "pattern" in user_message:
        response = "Based on your recent trading data, I can see some interesting patterns. Your risk management has improved significantly over the past month, with a 15% reduction in average drawdown. However, I notice you tend to overtrade after losses - consider taking breaks after 2 consecutive losses."
        insights = [
            {
                "type": "warning",
                "title": "Overtrading Pattern",
                "message": "You tend to increase trade frequency after losses",
                "recommendation": "Take breaks after 2 consecutive losses"
            },
            {
                "type": "success", 
                "title": "Risk Management",
                "message": "Your position sizing has improved by 15%",
                "recommendation": "Continue current approach"
            }
        ]
    elif "weakness" in user_message or "problem" in user_message:
        response = "Your main areas for improvement are: 1) Emotional trading after losses, 2) Position sizing consistency, and 3) Exit strategy timing. Focus on these three areas to see significant improvement in your performance."
        insights = [
            {
                "type": "warning",
                "title": "Emotional Trading",
                "message": "Trading decisions influenced by recent losses",
                "recommendation": "Implement trading breaks"
            }
        ]
    elif "strategy" in user_message or "improve" in user_message:
        response = "I recommend focusing on your morning trading sessions (9:30-11:00 AM) where your win rate is 25% higher. Also, consider reducing position size during high volatility periods and implementing a maximum daily loss limit of 2% of your account."
        insights = [
            {
                "type": "info",
                "title": "Morning Performance",
                "message": "Your best trades occur between 9:30-11:00 AM",
                "recommendation": "Focus trading during morning hours"
            }
        ]
    else:
        response = "I'm here to help you improve your trading performance! I can analyze your patterns, identify behavioral biases, suggest improvements, and provide personalized insights. What specific aspect of your trading would you like to discuss?"
        insights = None
    
    return ChatResponse(response=response, insights=insights)

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

# Run analysis pipeline
@app.post("/api/analyze")
async def run_analysis():
    """Run the full analysis pipeline on uploaded data"""
    try:
        # Path to mock data
        ledger_path = "backend/data/mock_trades_realistic.csv"
        
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

# Serve static files (React app)
app.mount("/static", StaticFiles(directory="web/dist"), name="static")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React app for all non-API routes"""
    if full_path.startswith("api/"):
        return {"error": "API endpoint not found"}
    
    # Serve index.html for all non-API routes
    return FileResponse("web/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
