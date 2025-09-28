// Behavioral tags based on trade_scores_with_day.csv columns
export const BEHAVIORAL_TAGS = [
  { key: 'outcome_win', label: 'Win', type: 'outcome', color: 'success' },
  { key: 'outcome_loss', label: 'Loss', type: 'outcome', color: 'danger' },
  { key: 'outcome_breakeven', label: 'Breakeven', type: 'outcome', color: 'warning' },
  { key: 'large_win', label: 'Large Win', type: 'behavior', color: 'success' },
  { key: 'large_loss', label: 'Large Loss', type: 'behavior', color: 'danger' },
  { key: 'revenge_immediate', label: 'Revenge Trade', type: 'behavior', color: 'danger' },
  { key: 'size_inconsistency', label: 'Size Inconsistency', type: 'behavior', color: 'warning' },
  { key: 'follow_through_win_immediate', label: 'Follow Through Win', type: 'behavior', color: 'success' },
  { key: 'disciplined_after_loss_immediate', label: 'Disciplined After Loss', type: 'behavior', color: 'success' },
  { key: 'consistent_size', label: 'Consistent Size', type: 'behavior', color: 'success' },
  { key: 'overtrading_day', label: 'Overtrading Day', type: 'behavior', color: 'danger' },
  { key: 'revenge_day', label: 'Revenge Day', type: 'behavior', color: 'danger' },
  { key: 'chop_day', label: 'Chop Day', type: 'behavior', color: 'warning' },
  { key: 'ticker_bias_lifetime', label: 'Ticker Bias (Lifetime)', type: 'behavior', color: 'warning' },
  { key: 'ticker_bias_recent', label: 'Ticker Bias (Recent)', type: 'behavior', color: 'warning' },
  { key: 'focused_day', label: 'Focused Day', type: 'behavior', color: 'success' },
  { key: 'green_day_low_activity', label: 'Green Day Low Activity', type: 'behavior', color: 'success' }
]

export const getTagColor = (color: string) => {
  const colors = {
    success: 'from-green-500 to-emerald-500',
    danger: 'from-red-500 to-rose-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-blue-500 to-cyan-500'
  }
  return colors[color as keyof typeof colors] || colors.info
}

export const getTagTextColor = (color: string) => {
  const colors = {
    success: 'text-green-300',
    danger: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300'
  }
  return colors[color as keyof typeof colors] || colors.info
}
