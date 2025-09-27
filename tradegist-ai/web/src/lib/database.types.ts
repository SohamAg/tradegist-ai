export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          side: 'BUY' | 'SELL' | 'SHORT' | 'COVER'
          qty: number
          price: number
          opened_at: string
          closed_at: string | null
          fees: number | null
          pnl: number | null
          raw_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          side: 'BUY' | 'SELL' | 'SHORT' | 'COVER'
          qty: number
          price: number
          opened_at: string
          closed_at?: string | null
          fees?: number | null
          pnl?: number | null
          raw_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          side?: 'BUY' | 'SELL' | 'SHORT' | 'COVER'
          qty?: number
          price?: number
          opened_at?: string
          closed_at?: string | null
          fees?: number | null
          pnl?: number | null
          raw_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      trade_behavior_tags: {
        Row: {
          id: string
          user_id: string
          trade_id: string
          behavior_code: string
          confidence: number
          rationale: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trade_id: string
          behavior_code: string
          confidence: number
          rationale?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trade_id?: string
          behavior_code?: string
          confidence?: number
          rationale?: string | null
          created_at?: string
        }
      }
      behaviors: {
        Row: {
          code: string
          label: string
          description: string | null
          category: string
          is_positive: boolean
        }
        Insert: {
          code: string
          label: string
          description?: string | null
          category: string
          is_positive: boolean
        }
        Update: {
          code?: string
          label?: string
          description?: string | null
          category?: string
          is_positive?: boolean
        }
      }
      metrics_daily: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          date: string
          pnl: number
          win_rate: number
          trade_count: number
          avg_win: number
          avg_loss: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          pnl?: number
          win_rate?: number
          trade_count?: number
          avg_win?: number
          avg_loss?: number
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          trade_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trade_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trade_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      ingest_log: {
        Row: {
          id: string
          user_id: string
          filename: string
          rows_processed: number
          rows_inserted: number
          rows_updated: number
          status: 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          rows_processed: number
          rows_inserted: number
          rows_updated: number
          status: 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          rows_processed?: number
          rows_inserted?: number
          rows_updated?: number
          status?: 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
      }
      trade_attachments: {
        Row: {
          id: string
          user_id: string
          trade_id: string
          type: 'image' | 'note'
          url: string | null
          text: string | null
          emotion: string | null
          ts: string
        }
        Insert: {
          id?: string
          user_id: string
          trade_id: string
          type: 'image' | 'note'
          url?: string | null
          text?: string | null
          emotion?: string | null
          ts?: string
        }
        Update: {
          id?: string
          user_id?: string
          trade_id?: string
          type?: 'image' | 'note'
          url?: string | null
          text?: string | null
          emotion?: string | null
          ts?: string
        }
      }
      emotions_catalog: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}