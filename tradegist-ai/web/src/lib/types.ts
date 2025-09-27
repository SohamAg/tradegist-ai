export interface Trade {
  id: string
  user_id: string
  symbol: string
  side: 'BUY' | 'SELL' | 'SHORT' | 'COVER'
  qty: number
  price: number
  opened_at: string
  closed_at?: string
  fees?: number
  pnl?: number
  raw_hash: string
  created_at: string
  updated_at: string
}

export interface BehaviorTag {
  id: string
  user_id: string
  trade_id: string
  behavior_code: string
  confidence: number
  rationale?: string
  created_at: string
}

export interface Behavior {
  code: string
  label: string
  description?: string
  category: string
  is_positive: boolean
}

export interface MetricsDaily {
  id: string
  user_id: string
  date: string
  pnl: number
  win_rate: number
  trade_count: number
  avg_win: number
  avg_loss: number
  created_at: string
}

export interface TradeAttachment {
  id: string
  user_id: string
  trade_id: string
  type: 'image' | 'note'
  url?: string
  text?: string
  emotion?: string
  ts: string
}

export interface Note {
  id: string
  user_id: string
  trade_id?: string
  content: string
  created_at: string
  updated_at: string
}

export interface IngestLog {
  id: string
  user_id: string
  filename: string
  rows_processed: number
  rows_inserted: number
  rows_updated: number
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
}

export interface EmotionCatalog {
  code: string
  label: string
}

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface KPIData {
  totalPortfolio: number
  pnl30d: number
  winRate30d: number
}

export interface CalendarPnLData {
  date: string
  pnl: number
  tradeCount: number
}

export interface BehaviorInsight {
  code: string
  label: string
  count: number
  avgScore: number
  category: string
  isPositive: boolean
}