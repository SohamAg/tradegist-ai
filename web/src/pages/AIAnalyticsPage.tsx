import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  Zap,
  DollarSign,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area
} from 'recharts'

const performanceData = [
  { date: '2024-01-01', pnl: 1200, trades: 8, winRate: 75 },
  { date: '2024-01-02', pnl: -300, trades: 5, winRate: 40 },
  { date: '2024-01-03', pnl: 800, trades: 6, winRate: 67 },
  { date: '2024-01-04', pnl: 1500, trades: 10, winRate: 80 },
  { date: '2024-01-05', pnl: -200, trades: 4, winRate: 25 },
  { date: '2024-01-06', pnl: 2200, trades: 12, winRate: 83 },
  { date: '2024-01-07', pnl: 900, trades: 7, winRate: 71 },
]

const sectorData = [
  { name: 'Technology', value: 45, color: '#3b82f6' },
  { name: 'Healthcare', value: 25, color: '#10b981' },
  { name: 'Finance', value: 15, color: '#f59e0b' },
  { name: 'Energy', value: 10, color: '#ef4444' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
]

const behavioralInsights = [
  {
    type: 'warning',
    title: 'Overtrading Pattern',
    description: 'You tend to increase trade frequency after losses',
    impact: 'High',
    recommendation: 'Take breaks after 2 consecutive losses',
    icon: AlertTriangle,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    type: 'success',
    title: 'Strong Risk Management',
    description: 'Excellent position sizing in volatile markets',
    impact: 'Positive',
    recommendation: 'Continue current risk management approach',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'info',
    title: 'Morning Performance',
    description: 'Your best trades occur between 9:30-11:00 AM',
    impact: 'Medium',
    recommendation: 'Focus trading activity during morning hours',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500'
  }
]

const aiRecommendations = [
  {
    category: 'Risk Management',
    title: 'Reduce Position Size',
    description: 'Consider reducing position size by 20% during high volatility periods',
    priority: 'High',
    impact: 'Could reduce drawdown by 15%'
  },
  {
    category: 'Strategy Optimization',
    title: 'Focus on Tech Stocks',
    description: 'Your win rate with technology stocks is 15% higher than average',
    priority: 'Medium',
    impact: 'Potential 25% improvement in returns'
  },
  {
    category: 'Behavioral',
    title: 'Implement Trading Breaks',
    description: 'Take a 30-minute break after any loss exceeding 2% of account',
    priority: 'High',
    impact: 'Reduces emotional trading by 40%'
  }
]

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'pnl' | 'trades' | 'winRate'>('pnl')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold">
              {entry.name}: {entry.value}
              {entry.name === 'PnL' && '$'}
              {entry.name === 'Win Rate' && '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              AI Analytics Dashboard
            </h1>
            <p className="text-slate-300 text-lg">Advanced insights powered by machine learning</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total P&L</p>
              <p className="text-3xl font-bold text-success-400">+$12,450</p>
              <p className="text-xs text-success-300">+15.2% this month</p>
            </div>
            <TrendingUp className="h-10 w-10 text-success-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Win Rate</p>
              <p className="text-3xl font-bold text-white">68.5%</p>
              <p className="text-xs text-slate-300">Above average</p>
            </div>
            <Target className="h-10 w-10 text-accent-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Risk Score</p>
              <p className="text-3xl font-bold text-warning-400">Medium</p>
              <p className="text-xs text-warning-300">Manageable risk</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-warning-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI Score</p>
              <p className="text-3xl font-bold text-primary-400">87/100</p>
              <p className="text-xs text-primary-300">Excellent</p>
            </div>
            <Brain className="h-10 w-10 text-primary-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <LineChart className="h-6 w-6 mr-2 text-primary-400" />
              Performance Over Time
            </h3>
            <div className="flex gap-2">
              {(['pnl', 'trades', 'winRate'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    selectedMetric === metric
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {metric === 'pnl' ? 'P&L' : metric === 'winRate' ? 'Win Rate' : 'Trades'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sector Allocation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <PieChart className="h-6 w-6 mr-2 text-accent-400" />
            Portfolio Allocation
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sectorData.map((sector, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-sm text-slate-300">{sector.name}: {sector.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-400" />
            Behavioral Insights
          </h3>
          <div className="space-y-4">
            {behavioralInsights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 bg-gradient-to-r ${insight.color}/10 border border-${insight.color.split('-')[1]}-500/30 rounded-xl`}
                >
                  <div className="flex items-start">
                    <Icon className={`h-6 w-6 mr-3 mt-0.5 text-${insight.color.split('-')[1]}-400`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                      <p className="text-sm text-slate-300 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Impact: {insight.impact}</span>
                        <span className="text-xs text-slate-400">{insight.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-glow"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-yellow-400" />
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{rec.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'High' 
                      ? 'bg-danger-500/20 text-danger-300'
                      : 'bg-warning-500/20 text-warning-300'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{rec.category}</span>
                  <span className="text-xs text-success-300">{rec.impact}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
