import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

interface Trade {
  id: string
  date: string
  ticker: string
  side: 'buy' | 'sell' | 'short' | 'cover'
  quantity: number
  entryPrice: number
  exitPrice?: number
  pnl?: number
  fees: number
  strategy: string
  notes: string
  mood: 'confident' | 'uncertain' | 'frustrated' | 'excited'
  status: 'open' | 'closed'
}

export default function TradeLogPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all')
  
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: '1',
      date: '2024-01-15',
      ticker: 'AAPL',
      side: 'buy',
      quantity: 100,
      entryPrice: 185.50,
      exitPrice: 192.30,
      pnl: 680,
      fees: 2.50,
      strategy: 'Swing Trade',
      notes: 'Strong earnings beat, held for 3 days',
      mood: 'confident',
      status: 'closed'
    },
    {
      id: '2',
      date: '2024-01-16',
      ticker: 'TSLA',
      side: 'sell',
      quantity: 50,
      entryPrice: 245.80,
      exitPrice: 238.20,
      pnl: -380,
      fees: 2.50,
      strategy: 'Day Trade',
      notes: 'Stop loss triggered, market volatility',
      mood: 'frustrated',
      status: 'closed'
    },
    {
      id: '3',
      date: '2024-01-17',
      ticker: 'NVDA',
      side: 'buy',
      quantity: 25,
      entryPrice: 420.00,
      fees: 2.50,
      strategy: 'Long Term',
      notes: 'AI growth play, holding for months',
      mood: 'excited',
      status: 'open'
    }
  ])

  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    side: 'buy',
    quantity: 0,
    entryPrice: 0,
    fees: 0,
    strategy: '',
    notes: '',
    mood: 'confident',
    status: 'open'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTrade: Trade = {
      id: Date.now().toString(),
      ...formData as Trade
    }
    setTrades([newTrade, ...trades])
    setShowForm(false)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      side: 'buy',
      quantity: 0,
      entryPrice: 0,
      fees: 0,
      strategy: '',
      notes: '',
      mood: 'confident',
      status: 'open'
    })
  }

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || trade.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalPnL = trades.filter(t => t.pnl).reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = trades.filter(t => t.pnl && t.pnl > 0).length / trades.filter(t => t.pnl).length * 100

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
              Trade Journal
            </h1>
            <p className="text-slate-300 text-lg">Track and analyze your trading performance</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary text-lg px-6 py-3 inline-flex items-center group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Trade
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-white">{trades.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-400" />
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
              <p className="text-slate-400 text-sm">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                ${totalPnL.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-400" />
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
              <p className="text-slate-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-accent-400" />
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
              <p className="text-slate-400 text-sm">Open Positions</p>
              <p className="text-2xl font-bold text-white">
                {trades.filter(t => t.status === 'open').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card-glow mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'open', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="card-glow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Date</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Ticker</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Side</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Qty</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Entry</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Exit</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">P&L</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Mood</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTrades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-300">{trade.date}</td>
                    <td className="py-4 px-6 font-semibold text-white">{trade.ticker}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.side === 'buy' || trade.side === 'cover'
                          ? 'bg-success-500/20 text-success-300'
                          : 'bg-danger-500/20 text-danger-300'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{trade.quantity}</td>
                    <td className="py-4 px-6 text-slate-300">${trade.entryPrice}</td>
                    <td className="py-4 px-6 text-slate-300">
                      {trade.exitPrice ? `$${trade.exitPrice}` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {trade.pnl ? (
                        <span className={`font-semibold ${
                          trade.pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                        }`}>
                          ${trade.pnl.toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.status === 'open'
                          ? 'bg-warning-500/20 text-warning-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.mood === 'confident' ? 'bg-success-500/20 text-success-300' :
                        trade.mood === 'excited' ? 'bg-accent-500/20 text-accent-300' :
                        trade.mood === 'frustrated' ? 'bg-danger-500/20 text-danger-300' :
                        'bg-warning-500/20 text-warning-300'
                      }`}>
                        {trade.mood}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trade Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-glow max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Add New Trade</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Ticker</label>
                    <input
                      type="text"
                      value={formData.ticker || ''}
                      onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                      className="input"
                      placeholder="AAPL"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Side</label>
                    <select
                      value={formData.side}
                      onChange={(e) => setFormData({ ...formData, side: e.target.value as any })}
                      className="input"
                      required
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                      <option value="short">Short</option>
                      <option value="cover">Cover</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="input"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.entryPrice || ''}
                      onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
                      className="input"
                      placeholder="185.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Exit Price (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.exitPrice || ''}
                      onChange={(e) => setFormData({ ...formData, exitPrice: Number(e.target.value) })}
                      className="input"
                      placeholder="192.30"
                    />
                  </div>
                  <div>
                    <label className="label">Fees</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fees || ''}
                      onChange={(e) => setFormData({ ...formData, fees: Number(e.target.value) })}
                      className="input"
                      placeholder="2.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Strategy</label>
                    <input
                      type="text"
                      value={formData.strategy || ''}
                      onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                      className="input"
                      placeholder="Swing Trade"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Mood</label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value as any })}
                      className="input"
                      required
                    >
                      <option value="confident">Confident</option>
                      <option value="excited">Excited</option>
                      <option value="uncertain">Uncertain</option>
                      <option value="frustrated">Frustrated</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input"
                      required
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input h-24 resize-none"
                    placeholder="Trade notes, observations, lessons learned..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Trade
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
