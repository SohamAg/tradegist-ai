import { supabase, fixedUserId, type Trade, type TradeWithScores, type DailyPnL, type TradeScore, type DayScore } from '../lib/supabase'

export class TradeService {
  // ====== TRADE OPERATIONS ======
  
  static async getTrades(limit = 5000, offset = 0, filters?: {
    startDate?: string
    endDate?: string
    ticker?: string
    side?: 'long' | 'short'
    mood?: string
  }) {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', fixedUserId)
      .order('trade_date', { ascending: false })
      .order('trade_id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters?.startDate) {
      query = query.gte('trade_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('trade_date', filters.endDate)
    }
    if (filters?.ticker) {
      query = query.eq('ticker', filters.ticker)
    }
    if (filters?.side) {
      query = query.eq('side', filters.side)
    }
    if (filters?.mood) {
      query = query.eq('mood', filters.mood)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Trade[]
  }

  static async getTradeWithScores(tradeId: number) {
    const { data, error } = await supabase
      .from('v_trade_scores_with_day')
      .select('*')
      .eq('trade_id', tradeId)
      .eq('user_id', fixedUserId)
      .single()

    if (error) throw error
    return data as TradeWithScores
  }

  static async createTrade(trade: Omit<Trade, 'trade_id' | 'user_id' | 'account_id'>) {
    const { data, error } = await supabase
      .from('trades')
      .insert({
        ...trade,
        user_id: fixedUserId,
        account_id: crypto.randomUUID()
      })
      .select()
      .single()

    if (error) throw error
    return data as Trade
  }

  static async updateTrade(tradeId: number, updates: Partial<Trade>) {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('trade_id', tradeId)
      .eq('user_id', fixedUserId)
      .select()
      .single()

    if (error) throw error
    return data as Trade
  }

  static async deleteTrade(tradeId: number) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('trade_id', tradeId)
      .eq('user_id', fixedUserId)

    if (error) throw error
  }

  // ====== ANALYTICS & SCORES ======

  static async getTradeScores(tradeIds?: number[]) {
    let query = supabase
      .from('trade_scores')
      .select('*')
      .eq('user_id', fixedUserId)

    if (tradeIds && tradeIds.length > 0) {
      query = query.in('trade_id', tradeIds)
    }

    const { data, error } = await query
    if (error) throw error
    return data as TradeScore[]
  }

  static async getDayScores(startDate?: string, endDate?: string) {
    let query = supabase
      .from('day_scores')
      .select('*')
      .eq('user_id', fixedUserId)
      .order('trade_date', { ascending: false })

    if (startDate) {
      query = query.gte('trade_date', startDate)
    }
    if (endDate) {
      query = query.lte('trade_date', endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data as DayScore[]
  }

  static async getDailyPnL(startDate?: string, endDate?: string) {
    let query = supabase
      .from('daily_pnl')
      .select('*')
      .eq('user_id', fixedUserId)
      .order('day', { ascending: true })

    if (startDate) {
      query = query.gte('day', startDate)
    }
    if (endDate) {
      query = query.lte('day', endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data as DailyPnL[]
  }

  // ====== AGGREGATED ANALYTICS ======

  static async getTradingStats() {
    const { data, error } = await supabase
      .from('v_total_realized')
      .select('total_realized')
      .eq('user_id', fixedUserId)
      .single()

    if (error) throw error

    // Get additional stats
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('realized_pnl, trade_date')
      .eq('user_id', fixedUserId)

    if (tradesError) throw tradesError

    const totalTrades = trades?.length || 0
    const winningTrades = trades?.filter(t => t.realized_pnl > 0).length || 0
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return {
      totalRealized: data?.total_realized || 0,
      totalTrades,
      winningTrades,
      winRate: Math.round(winRate * 100) / 100
    }
  }

  static async getMoodAnalysis() {
    const { data, error } = await supabase
      .from('trades')
      .select('mood, realized_pnl')
      .eq('user_id', fixedUserId)
      .not('mood', 'is', null)

    if (error) throw error

    const moodStats = data?.reduce((acc, trade) => {
      const mood = trade.mood || 'unknown'
      if (!acc[mood]) {
        acc[mood] = { trades: 0, totalPnl: 0, wins: 0 }
      }
      acc[mood].trades++
      acc[mood].totalPnl += trade.realized_pnl
      if (trade.realized_pnl > 0) acc[mood].wins++
      return acc
    }, {} as Record<string, { trades: number; totalPnl: number; wins: number }>)

    return Object.entries(moodStats || {}).map(([mood, stats]) => ({
      mood,
      trades: stats.trades,
      totalPnl: stats.totalPnl,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
    }))
  }

  static async getBehavioralInsights() {
    const { data: tradeScores, error: tradeError } = await supabase
      .from('trade_scores')
      .select('*')
      .eq('user_id', fixedUserId)

    if (tradeError) throw tradeError

    const { data: dayScores, error: dayError } = await supabase
      .from('day_scores')
      .select('*')
      .eq('user_id', fixedUserId)

    if (dayError) throw dayError

    // Calculate behavioral insights
    const insights = []

    // Revenge trading analysis
    const revengeTrades = tradeScores?.filter(t => t.revenge_immediate > 0.5).length || 0
    const totalTrades = tradeScores?.length || 0
    if (revengeTrades > 0) {
      insights.push({
        type: 'warning',
        title: 'Revenge Trading Detected',
        description: `${revengeTrades} trades show revenge trading patterns`,
        frequency: `${Math.round((revengeTrades / totalTrades) * 100)}% of trades`,
        recommendation: 'Implement cooling-off periods after losses'
      })
    }

    // Overtrading analysis
    const overtradingDays = dayScores?.filter(d => d.overtrading_day > 0.5).length || 0
    const totalDays = dayScores?.length || 0
    if (overtradingDays > 0) {
      insights.push({
        type: 'warning',
        title: 'Overtrading Pattern',
        description: `${overtradingDays} days show overtrading behavior`,
        frequency: `${Math.round((overtradingDays / totalDays) * 100)}% of trading days`,
        recommendation: 'Set daily trade limits and stick to them'
      })
    }

    // Consistent sizing analysis
    const consistentTrades = tradeScores?.filter(t => t.consistent_size > 0.5).length || 0
    if (consistentTrades > 0) {
      insights.push({
        type: 'success',
        title: 'Consistent Position Sizing',
        description: `${consistentTrades} trades show consistent sizing`,
        frequency: `${Math.round((consistentTrades / totalTrades) * 100)}% of trades`,
        recommendation: 'Continue current sizing approach'
      })
    }

    return insights
  }

  static async getTimeAnalysis() {
    const { data, error } = await supabase
      .from('trades')
      .select('trade_time, realized_pnl')
      .eq('user_id', fixedUserId)
      .not('trade_time', 'is', null)

    if (error) throw error

    // Group by hour
    const hourlyStats = data?.reduce((acc, trade) => {
      const hour = new Date(trade.trade_time).getHours()
      const hourKey = `${hour}:00-${hour + 1}:00`
      
      if (!acc[hourKey]) {
        acc[hourKey] = { trades: 0, totalPnl: 0, wins: 0 }
      }
      acc[hourKey].trades++
      acc[hourKey].totalPnl += trade.realized_pnl
      if (trade.realized_pnl > 0) acc[hourKey].wins++
      
      return acc
    }, {} as Record<string, { trades: number; totalPnl: number; wins: number }>)

    return Object.entries(hourlyStats || {}).map(([time, stats]) => ({
      time,
      trades: stats.trades,
      pnl: stats.totalPnl,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
    }))
  }

  // ====== BEHAVIORAL TAGS ======

  static async getBehavioralTags() {
    const { data, error } = await supabase
      .from('tags_raw')
      .select('*')
      .eq('user_id', fixedUserId)

    if (error) throw error
    return data || []
  }

  static async getTradeBehavioralTags(tradeIds?: number[]) {
    console.log('getTradeBehavioralTags called with tradeIds:', tradeIds)
    let query = supabase
      .from('v_trade_scores_with_day')
      .select('*')
      .eq('user_id', fixedUserId)

    if (tradeIds && tradeIds.length > 0) {
      query = query.in('trade_id', tradeIds)
    }

    const { data, error } = await query
    console.log('Supabase query result:', { data, error })
    if (error) throw error
    return data
  }

  static async getBehavioralTagsForTrade(tradeId: number) {
    const { data, error } = await supabase
      .from('v_trade_scores_with_day')
      .select('*')
      .eq('trade_id', tradeId)
      .eq('user_id', fixedUserId)
      .single()

    if (error) throw error
    
    // Convert scores to behavioral tags
    const tags = []
    if (data) {
      // Trade-level tags
      if (data.outcome_win > 0.5) tags.push({ key: 'outcome_win', label: 'Win', color: 'success' })
      if (data.outcome_loss > 0.5) tags.push({ key: 'outcome_loss', label: 'Loss', color: 'danger' })
      if (data.outcome_breakeven > 0.5) tags.push({ key: 'outcome_breakeven', label: 'Breakeven', color: 'warning' })
      if (data.large_win > 0.5) tags.push({ key: 'large_win', label: 'Large Win', color: 'success' })
      if (data.large_loss > 0.5) tags.push({ key: 'large_loss', label: 'Large Loss', color: 'danger' })
      if (data.revenge_immediate > 0.5) tags.push({ key: 'revenge_immediate', label: 'Revenge Trade', color: 'danger' })
      if (data.size_inconsistency > 0.5) tags.push({ key: 'size_inconsistency', label: 'Size Inconsistent', color: 'warning' })
      if (data.follow_through_win_immediate > 0.5) tags.push({ key: 'follow_through_win_immediate', label: 'Follow Through', color: 'success' })
      if (data.disciplined_after_loss_immediate > 0.5) tags.push({ key: 'disciplined_after_loss_immediate', label: 'Disciplined', color: 'success' })
      if (data.consistent_size > 0.5) tags.push({ key: 'consistent_size', label: 'Consistent Size', color: 'primary' })

      // Day-level tags
      if (data.overtrading_day > 0.5) tags.push({ key: 'overtrading_day', label: 'Overtrading Day', color: 'danger' })
      if (data.revenge_day > 0.5) tags.push({ key: 'revenge_day', label: 'Revenge Day', color: 'danger' })
      if (data.chop_day > 0.5) tags.push({ key: 'chop_day', label: 'Chop Day', color: 'warning' })
      if (data.ticker_bias_lifetime > 0.5) tags.push({ key: 'ticker_bias_lifetime', label: 'Ticker Bias (Lifetime)', color: 'danger' })
      if (data.ticker_bias_recent > 0.5) tags.push({ key: 'ticker_bias_recent', label: 'Ticker Bias (Recent)', color: 'warning' })
      if (data.focused_day > 0.5) tags.push({ key: 'focused_day', label: 'Focused Day', color: 'primary' })
      if (data.green_day_low_activity > 0.5) tags.push({ key: 'green_day_low_activity', label: 'Green Day (Low Activity)', color: 'success' })
    }

    return tags
  }

  // ====== CSV IMPORT ======

  static async importTradesFromCSV(file: File): Promise<{
    success: boolean;
    message: string;
    trades_count: number;
    tags_count: number;
    supabase_imported: boolean;
    trade_scores_count: number;
    day_scores_count: number;
  }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/import-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 0 || response.status === 500) {
          throw new Error('Backend server is not running. Please start the backend server.')
        }
        const error = await response.text()
        throw new Error(`CSV import failed: ${error}`)
      }

      return await response.json()
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 8000.')
      }
      throw error
    }
  }

  static async resetData(): Promise<{
    success: boolean;
    message: string;
    remaining_trades: number;
  }> {
    const response = await fetch('http://localhost:8000/api/reset-data', {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Data reset failed: ${error}`)
    }

    return await response.json()
  }
}
