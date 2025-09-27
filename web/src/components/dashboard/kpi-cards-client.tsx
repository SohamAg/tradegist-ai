'use client'

import { StatCard } from '@/components/ui/stat-card'
import { DollarSign, TrendingUp, Target } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/date'

interface KPIData {
  totalPortfolio: number
  pnl30d: number
  winRate30d: number
}

interface KpiCardsClientProps {
  data: KPIData
}

export function KpiCardsClient({ data }: KpiCardsClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Portfolio"
        value={formatCurrency(data.totalPortfolio)}
        icon={DollarSign}
        changeType="positive"
        change="+2.4% from last month"
      />
      <StatCard
        title="PnL (30 Days)"
        value={formatCurrency(data.pnl30d)}
        icon={TrendingUp}
        changeType={data.pnl30d > 0 ? 'positive' : 'negative'}
        change={data.pnl30d > 0 ? '+12.3% vs last period' : '-5.2% vs last period'}
      />
      <StatCard
        title="Win Rate (30 Days)"
        value={formatPercent(data.winRate30d)}
        icon={Target}
        changeType="positive"
        change="+3.2% improvement"
      />
    </div>
  )
}