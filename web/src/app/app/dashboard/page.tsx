import { createClient } from '@/lib/supabase-server'
import { KpiCardsClient } from '@/components/dashboard/kpi-cards-client'
import { CalendarPnLClient } from '@/components/dashboard/calendar-pnl-client'
import { BehaviorRadar } from '@/components/dashboard/behavior-radar'
import { CalendarPnLData } from '@/lib/types'

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
      <KpiCardsClient data={mockKPIData} />

      {/* Calendar and Behavior Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarPnLClient data={mockCalendarData} />
        <BehaviorRadar data={mockBehaviorData} />
      </div>
    </div>
  )
}