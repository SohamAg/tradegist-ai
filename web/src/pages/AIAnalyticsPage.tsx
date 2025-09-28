import { useState, useEffect } from 'react'
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
  LineChart,
  Users,
  Clock,
  Tag,
  Heart,
  AlertCircle,
  Award,
  TrendingUp as TrendingUpIcon
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
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { BEHAVIORAL_TAGS } from '../utils/tags'
import { TradeService } from '../services/tradeService'

const performanceData = [
  { date: '2024-01-01', pnl: 1200, trades: 8, winRate: 75, mood: 'confident', revengeTrades: 1, overtrading: 0 },
  { date: '2024-01-02', pnl: -300, trades: 5, winRate: 40, mood: 'frustrated', revengeTrades: 2, overtrading: 1 },
  { date: '2024-01-03', pnl: 800, trades: 6, winRate: 67, mood: 'confident', revengeTrades: 0, overtrading: 0 },
  { date: '2024-01-04', pnl: 1500, trades: 10, winRate: 80, mood: 'excited', revengeTrades: 1, overtrading: 1 },
  { date: '2024-01-05', pnl: -200, trades: 4, winRate: 25, mood: 'uncertain', revengeTrades: 1, overtrading: 0 },
  { date: '2024-01-06', pnl: 2200, trades: 12, winRate: 83, mood: 'excited', revengeTrades: 0, overtrading: 2 },
  { date: '2024-01-07', pnl: 900, trades: 7, winRate: 71, mood: 'confident', revengeTrades: 0, overtrading: 0 },
]

const moodData = [
  { mood: 'Confident', trades: 45, pnl: 8500, winRate: 78, color: '#10b981' },
  { mood: 'Excited', trades: 28, pnl: 4200, winRate: 71, color: '#8b5cf6' },
  { mood: 'Frustrated', trades: 18, pnl: -1200, winRate: 33, color: '#ef4444' },
  { mood: 'Uncertain', trades: 12, pnl: -800, winRate: 42, color: '#f59e0b' },
]

const tagFrequencyData = [
  { tag: 'Win', frequency: 65, impact: 'positive', color: '#10b981' },
  { tag: 'Loss', frequency: 35, impact: 'negative', color: '#ef4444' },
  { tag: 'Large Win', frequency: 12, impact: 'positive', color: '#059669' },
  { tag: 'Large Loss', frequency: 8, impact: 'negative', color: '#dc2626' },
  { tag: 'Revenge Trade', frequency: 15, impact: 'negative', color: '#f97316' },
  { tag: 'Overtrading Day', frequency: 22, impact: 'negative', color: '#eab308' },
  { tag: 'Consistent Size', frequency: 58, impact: 'positive', color: '#06b6d4' },
  { tag: 'Focused Day', frequency: 45, impact: 'positive', color: '#8b5cf6' },
]

const behavioralRadarData = [
  { subject: 'Risk Management', A: 85, B: 100, fullMark: 100 },
  { subject: 'Emotional Control', A: 70, B: 100, fullMark: 100 },
  { subject: 'Consistency', A: 80, B: 100, fullMark: 100 },
  { subject: 'Discipline', A: 75, B: 100, fullMark: 100 },
  { subject: 'Patience', A: 65, B: 100, fullMark: 100 },
  { subject: 'Adaptability', A: 90, B: 100, fullMark: 100 },
]

const timeAnalysisData = [
  { time: '9:00-10:00', trades: 15, pnl: 1200, winRate: 80, mood: 'confident' },
  { time: '10:00-11:00', trades: 22, pnl: 1800, winRate: 77, mood: 'confident' },
  { time: '11:00-12:00', trades: 18, pnl: 600, winRate: 67, mood: 'uncertain' },
  { time: '12:00-13:00', trades: 8, pnl: -200, winRate: 50, mood: 'frustrated' },
  { time: '13:00-14:00', trades: 12, pnl: 400, winRate: 58, mood: 'uncertain' },
  { time: '14:00-15:00', trades: 20, pnl: 800, winRate: 70, mood: 'confident' },
  { time: '15:00-16:00', trades: 25, pnl: 1000, winRate: 72, mood: 'excited' },
]

const behavioralInsights = [
  {
    type: 'critical',
    title: 'Revenge Trading Alert',
    description: 'You tend to make revenge trades after losses, leading to larger drawdowns',
    impact: 'High Risk',
    recommendation: 'Implement a 30-minute cooling-off period after any loss',
    frequency: '15% of trades',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-500'
  },
  {
    type: 'warning',
    title: 'Overtrading Pattern',
    description: 'High trade frequency on volatile days increases risk exposure',
    impact: 'Medium Risk',
    recommendation: 'Set daily trade limits and stick to them',
    frequency: '22% of trading days',
    icon: Activity,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    type: 'success',
    title: 'Consistent Sizing',
    description: 'Excellent position sizing discipline across different market conditions',
    impact: 'Positive',
    recommendation: 'Continue current sizing approach',
    frequency: '58% of trades',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'info',
    title: 'Morning Performance',
    description: 'Your best trades occur between 9:30-11:00 AM with 80% win rate',
    impact: 'Optimization',
    recommendation: 'Focus trading activity during morning hours',
    frequency: 'Peak performance window',
    icon: Clock,
    color: 'from-blue-500 to-cyan-500'
  }
]

const moodInsights = [
  {
    mood: 'Confident',
    analysis: 'Your most profitable mood state with 78% win rate',
    pnl: 8500,
    trades: 45,
    recommendation: 'Maintain confidence-building routines before trading',
    color: 'success'
  },
  {
    mood: 'Excited',
    analysis: 'High energy but slightly lower discipline - watch for overtrading',
    pnl: 4200,
    trades: 28,
    recommendation: 'Channel excitement into focused analysis rather than more trades',
    color: 'accent'
  },
  {
    mood: 'Frustrated',
    analysis: 'Dangerous state - leads to revenge trading and poor decisions',
    pnl: -1200,
    trades: 18,
    recommendation: 'Take breaks when frustrated - avoid trading decisions',
    color: 'danger'
  },
  {
    mood: 'Uncertain',
    analysis: 'Indecision leads to missed opportunities and inconsistent sizing',
    pnl: -800,
    trades: 12,
    recommendation: 'Develop clear entry/exit rules to reduce uncertainty',
    color: 'warning'
  }
]

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'pnl' | 'trades' | 'winRate'>('pnl')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRealized: 0,
    totalTrades: 0,
    winRate: 0,
    behavioralScore: 0
  })
  const [moodData, setMoodData] = useState<any[]>([])
  const [behavioralInsights, setBehavioralInsights] = useState<any[]>([])
  const [timeAnalysis, setTimeAnalysis] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load all analytics data in parallel
      const [
        tradingStats,
        moodAnalysis,
        insights,
        timeAnalysisData,
        dailyPnL
      ] = await Promise.all([
        TradeService.getTradingStats(),
        TradeService.getMoodAnalysis(),
        TradeService.getBehavioralInsights(),
        TradeService.getTimeAnalysis(),
        TradeService.getDailyPnL()
      ])

      setStats({
        totalRealized: tradingStats.totalRealized,
        totalTrades: tradingStats.totalTrades,
        winRate: tradingStats.winRate,
        behavioralScore: 87 // This would come from your behavioral analysis
      })

      setMoodData(moodAnalysis)
      setBehavioralInsights(insights)
      setTimeAnalysis(timeAnalysisData)
      setPerformanceData(dailyPnL.map(d => ({
        date: d.day,
        pnl: d.realized_pnl,
        trades: 0, // Would need to calculate from trades
        winRate: 0 // Would need to calculate
      })))

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
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
            <p className="text-slate-300 text-lg">Advanced behavioral analysis and trading insights</p>
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
              <p className="text-3xl font-bold text-success-400">
                ${stats.totalRealized.toFixed(2)}
              </p>
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
              <p className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
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
              <p className="text-slate-400 text-sm">Behavioral Score</p>
              <p className="text-3xl font-bold text-primary-400">{stats.behavioralScore}/100</p>
              <p className="text-xs text-primary-300">Excellent</p>
            </div>
            <Brain className="h-10 w-10 text-primary-400" />
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
              <p className="text-slate-400 text-sm">Total Trades</p>
              <p className="text-3xl font-bold text-warning-400">{stats.totalTrades}</p>
              <p className="text-xs text-warning-300">This period</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-warning-400" />
          </div>
        </motion.div>
      </div>

      {/* Behavioral Analysis Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Brain className="h-6 w-6 mr-3 text-purple-400" />
            Behavioral Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Behavioral Radar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Trading Psychology Profile</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={behavioralRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Radar
                      name="Your Performance"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tag Frequency */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Behavioral Tag Frequency</h3>
              <div className="space-y-3">
                {tagFrequencyData.map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-white font-medium">{tag.tag}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-300">{tag.frequency}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tag.impact === 'positive' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {tag.impact}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mood Analysis Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Heart className="h-6 w-6 mr-3 text-pink-400" />
            Mood Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mood Performance Chart */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Performance by Mood</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mood" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mood Insights */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Mood Insights</h3>
              <div className="space-y-4">
                {moodInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      insight.color === 'success' ? 'bg-green-500/10 border-green-500/30' :
                      insight.color === 'accent' ? 'bg-purple-500/10 border-purple-500/30' :
                      insight.color === 'danger' ? 'bg-red-500/10 border-red-500/30' :
                      'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{insight.mood}</h4>
                      <span className={`text-sm font-medium ${
                        insight.color === 'success' ? 'text-green-300' :
                        insight.color === 'accent' ? 'text-purple-300' :
                        insight.color === 'danger' ? 'text-red-300' :
                        'text-yellow-300'
                      }`}>
                        {insight.pnl >= 0 ? '+' : ''}${insight.pnl}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{insight.analysis}</p>
                    <p className="text-xs text-slate-400">{insight.recommendation}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time Analysis */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-blue-400" />
            Time-Based Analysis
          </h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeAnalysisData}>
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#timeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <h4 className="text-white font-semibold mb-2">Peak Performance</h4>
              <p className="text-primary-400 font-bold">10:00-11:00 AM</p>
              <p className="text-slate-400 text-sm">80% win rate, $1,800 avg P&L</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <h4 className="text-white font-semibold mb-2">Avoid Trading</h4>
              <p className="text-danger-400 font-bold">12:00-1:00 PM</p>
              <p className="text-slate-400 text-sm">50% win rate, -$200 avg P&L</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <h4 className="text-white font-semibold mb-2">Best Volume</h4>
              <p className="text-success-400 font-bold">3:00-4:00 PM</p>
              <p className="text-slate-400 text-sm">25 trades, 72% win rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Critical Insights */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 text-yellow-400" />
            Critical Behavioral Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {behavioralInsights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border ${
                    insight.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start mb-4">
                    <Icon className={`h-6 w-6 mr-3 mt-0.5 ${
                      insight.type === 'critical' ? 'text-red-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      insight.type === 'success' ? 'text-green-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
                      <p className="text-slate-300 text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          insight.type === 'critical' ? 'bg-red-500/20 text-red-300' :
                          insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                          insight.type === 'success' ? 'bg-green-500/20 text-green-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {insight.impact}
                        </span>
                        <span className="text-xs text-slate-400">{insight.frequency}</span>
                      </div>
                      <p className="text-xs text-slate-400 italic">💡 {insight.recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Performance Over Time */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
      </div>
    </div>
  )
}