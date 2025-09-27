import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Brain, TrendingUp, TriangleAlert as AlertTriangle, Target } from 'lucide-react'

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground">
          Advanced analytics and behavioral pattern recognition
        </p>
      </div>

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

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Behavioral Patterns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-400">
                  Revenge Trading Detected
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  You've shown patterns of revenge trading after losses. Consider implementing cooling-off periods.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-400">
                  Disciplined Risk Management
                </h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">
                  Your position sizing has been consistent and well-managed this month.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400">
                  Overtrading on Volatile Days
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  High-volatility days correlate with increased trade frequency. Consider reducing activity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Best Performing Strategies</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Momentum Trading</span>
                    <span className="text-sm font-medium text-emerald-600">+12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Swing Trading</span>
                    <span className="text-sm font-medium text-emerald-600">+8.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Day Trading</span>
                    <span className="text-sm font-medium text-red-600">-2.1%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Time-based Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Morning (9-11 AM)</span>
                    <span className="text-sm font-medium text-emerald-600">+15.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Afternoon (1-3 PM)</span>
                    <span className="text-sm font-medium text-emerald-600">+6.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Late Day (3-4 PM)</span>
                    <span className="text-sm font-medium text-red-600">-4.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🎯 Focus on Morning Sessions</h4>
              <p className="text-sm text-muted-foreground">
                Your performance is strongest between 9-11 AM. Consider concentrating your trading activity during this window.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">⚠️ Implement Loss Limits</h4>
              <p className="text-sm text-muted-foreground">
                Set daily loss limits to prevent revenge trading patterns. Consider a 2% daily drawdown limit.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📊 Reduce Position Size</h4>
              <p className="text-sm text-muted-foreground">
                On high-volatility days, consider reducing position sizes by 25-50% to manage risk.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📝 Journal More Frequently</h4>
              <p className="text-sm text-muted-foreground">
                Adding notes and emotions to trades will improve pattern recognition accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}