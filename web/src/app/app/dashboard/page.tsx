import { createClient } from '@/lib/supabase-server'
import { StatCard } from '@/components/ui/stat-card'
import { CalendarPnL } from '@/components/dashboard/calendar-pnl'
import { BehaviorRadar } from '@/components/dashboard/behavior-radar'
import { DollarSign, TrendingUp, Target } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/date'

// Mock data - replace with real data fetching
const mockKPIData = {
  totalPortfolio: 125000,
  pnl30d: 2450,
  winRate30d: 68.5
}

const mockCalendarData = [
  { date: '2024-01-15', pnl: 250, tradeCount: 3 },
  { date: '2024-01-16', pnl: -120, tradeCount: 2 },
  { date: '2024-01-17', pnl: 380, tradeCount: 4 },
  // Add more mock data as needed
]

const mockBehaviorData = [
  { code: 'revenge_trading', label: 'Revenge Trading', count: 5, avgScore: 0.75, category: 'negative', isPositive: false },
  { code: 'disciplined_entry', label: 'Disciplined Entry', count: 12, avgScore: 0.85, category: 'positive', isPositive: true },
  { code: 'overtrading', label: 'Overtrading', count: 3, avgScore: 0.65, category: 'negative', isPositive: false },
  { code: 'risk_management', label: 'Risk Management', count: 8, avgScore: 0.90, category: 'positive', isPositive: true },
]

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Portfolio"
          value={formatCurrency(mockKPIData.totalPortfolio)}
          icon={DollarSign}
          changeType="positive"
          change="+2.4% from last month"
        />
        <StatCard
          title="PnL (30 Days)"
          value={formatCurrency(mockKPIData.pnl30d)}
          icon={TrendingUp}
          changeType={mockKPIData.pnl30d > 0 ? 'positive' : 'negative'}
          change={mockKPIData.pnl30d > 0 ? '+12.3% vs last period' : '-5.2% vs last period'}
        />
        <StatCard
          title="Win Rate (30 Days)"
          value={formatPercent(mockKPIData.winRate30d)}
          icon={Target}
          changeType="positive"
          change="+3.2% improvement"
        />
      </div>

      {/* Calendar and Behavior Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarPnL 
          data={mockCalendarData}
          onDayClick={(date) => {
            console.log('Day clicked:', date)
            // TODO: Navigate to trades for that day
          }}
        />
        <BehaviorRadar data={mockBehaviorData} />
      </div>
    </div>
  )
}