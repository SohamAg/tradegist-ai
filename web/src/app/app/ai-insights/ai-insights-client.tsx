'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Brain, TrendingUp, TriangleAlert as AlertTriangle, Target } from 'lucide-react'

export function AIInsightsClient() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Behavior Score"
          value="7.2/10"
          icon={Brain}
          changeType="positive"
          change="+0.8 this month"
        />
        <StatCard
          title="Pattern Accuracy"
          value="84%"
          icon={Target}
          changeType="positive"
          change="+5% improvement"
        />
        <StatCard
          title="Risk Alerts"
          value="3"
          icon={AlertTriangle}
          changeType="neutral"
          change="Active warnings"
        />
        <StatCard
          title="Trend Strength"
          value="Strong"
          icon={TrendingUp}
          changeType="positive"
          change="Bullish momentum"
        />
      </div>
    </div>
  )
}