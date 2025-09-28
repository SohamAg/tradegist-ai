import { useState, useEffect } from 'react'
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
  BarChart3,
  Upload,
  Download,
  Tag
} from 'lucide-react'
import { BEHAVIORAL_TAGS, getTagColor, getTagTextColor } from '../utils/tags'
import { TradeService, type Trade } from '../services/tradeService'

export default function TradeLogPage() {
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTicker, setFilterTicker] = useState('')
  const [filterSide, setFilterSide] = useState<'all' | 'long' | 'short'>('all')
  const [filterDateRange, setFilterDateRange] = useState<'all' | '7d' | '30d' | '90d' | '1y'>('all')
  const [filterTag, setFilterTag] = useState<string[]>([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showTradeDetails, setShowTradeDetails] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMoreTrades, setHasMoreTrades] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [behavioralTags, setBehavioralTags] = useState<Record<number, any[]>>({})
  
  const [formData, setFormData] = useState<Partial<Trade>>({
    trade_date: new Date().toISOString().split('T')[0],
    side: 'long',
    qty: 0,
    entry_price: 0,
    exit_price: 0,
    fees: 0,
    strategy: '',
    note: '',
    manual_tags: ''
  })

  // Load trades on component mount
  useEffect(() => {
    loadTrades()
  }, [])

  // Collect available tags when trades or behavioral tags change
  useEffect(() => {
    const allTags = new Set<string>()
    
    trades.forEach(trade => {
      // Add manual tags
      if (trade.manual_tags) {
        trade.manual_tags.split(',').forEach(tag => {
          const cleanTag = tag.trim()
          if (cleanTag && cleanTag.toLowerCase() !== 'nan') {
            allTags.add(cleanTag)
          }
        })
      }
      
      // Add behavioral tags
      const tradeBehavioralTags = behavioralTags[trade.trade_id] || []
      tradeBehavioralTags.forEach(tag => {
        allTags.add(tag.label)
      })
    })
    
    setAvailableTags(Array.from(allTags).sort())
  }, [trades, behavioralTags])

  const loadTrades = async (offset = 0, append = false) => {
    try {
      setLoading(true)
      const data = await TradeService.getTrades(5000, offset)
      
      if (append) {
        setTrades(prev => [...prev, ...data])
      } else {
        setTrades(data)
      }
      
      // Load behavioral tags for all trades
      const tradeIds = data.map(t => t.trade_id)
      const tagsData = await TradeService.getTradeBehavioralTags(tradeIds)
      
      // Process tags data
      const newBehavioralTags = { ...behavioralTags }
      tagsData.forEach(tagData => {
        const tags = []
        if (tagData.outcome_win > 0.5) tags.push({ key: 'outcome_win', label: 'Win', color: 'success' })
        if (tagData.outcome_loss > 0.5) tags.push({ key: 'outcome_loss', label: 'Loss', color: 'danger' })
        if (tagData.outcome_breakeven > 0.5) tags.push({ key: 'outcome_breakeven', label: 'Breakeven', color: 'warning' })
        if (tagData.large_win > 0.5) tags.push({ key: 'large_win', label: 'Large Win', color: 'success' })
        if (tagData.large_loss > 0.5) tags.push({ key: 'large_loss', label: 'Large Loss', color: 'danger' })
        if (tagData.revenge_immediate > 0.5) tags.push({ key: 'revenge_immediate', label: 'Revenge Trade', color: 'danger' })
        if (tagData.size_inconsistency > 0.5) tags.push({ key: 'size_inconsistency', label: 'Size Inconsistent', color: 'warning' })
        if (tagData.follow_through_win_immediate > 0.5) tags.push({ key: 'follow_through_win_immediate', label: 'Follow Through', color: 'success' })
        if (tagData.disciplined_after_loss_immediate > 0.5) tags.push({ key: 'disciplined_after_loss_immediate', label: 'Disciplined', color: 'success' })
        if (tagData.consistent_size > 0.5) tags.push({ key: 'consistent_size', label: 'Consistent Size', color: 'primary' })
        if (tagData.overtrading_day > 0.5) tags.push({ key: 'overtrading_day', label: 'Overtrading Day', color: 'danger' })
        if (tagData.revenge_day > 0.5) tags.push({ key: 'revenge_day', label: 'Revenge Day', color: 'danger' })
        if (tagData.chop_day > 0.5) tags.push({ key: 'chop_day', label: 'Chop Day', color: 'warning' })
        if (tagData.ticker_bias_lifetime > 0.5) tags.push({ key: 'ticker_bias_lifetime', label: 'Ticker Bias (Lifetime)', color: 'danger' })
        if (tagData.ticker_bias_recent > 0.5) tags.push({ key: 'ticker_bias_recent', label: 'Ticker Bias (Recent)', color: 'warning' })
        if (tagData.focused_day > 0.5) tags.push({ key: 'focused_day', label: 'Focused Day', color: 'primary' })
        if (tagData.green_day_low_activity > 0.5) tags.push({ key: 'green_day_low_activity', label: 'Green Day (Low Activity)', color: 'success' })
        
        newBehavioralTags[tagData.trade_id] = tags
      })
      
      setBehavioralTags(newBehavioralTags)
      
      // Check if we got fewer trades than requested (indicating no more data)
      setHasMoreTrades(data.length === 5000)
      setCurrentOffset(offset + data.length)
    } catch (err) {
      setError('Failed to load trades')
      console.error('Error loading trades:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculatePnL = (side: string, qty: number, entryPrice: number, exitPrice: number, fees: number) => {
    if (!exitPrice) return 0
    
    let pnl = 0
    if (side === 'long') {
      pnl = (exitPrice - entryPrice) * qty - fees
    } else if (side === 'short') {
      pnl = (entryPrice - exitPrice) * qty - fees
    }
    
    return pnl
  }

  const handleFormChange = (field: string, value: any) => {
    const updatedFormData = { ...formData, [field]: value }
    
    // Auto-calculate P&L when exit price is provided
    if (field === 'exit_price' && value && formData.qty && formData.entry_price && formData.side) {
      const pnl = calculatePnL(
        formData.side,
        formData.qty,
        formData.entry_price,
        value,
        formData.fees || 0
      )
      updatedFormData.realized_pnl = pnl
    }
    
    setFormData(updatedFormData)
  }

  const loadMoreTrades = () => {
    if (!loading && hasMoreTrades) {
      loadTrades(currentOffset, true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newTrade = await TradeService.createTrade({
        ticker: formData.ticker || '',
        side: formData.side || 'long',
        trade_date: formData.trade_date || new Date().toISOString().split('T')[0],
        trade_time: formData.trade_time || null,
        qty: formData.qty || 0,
        entry_price: formData.entry_price || 0,
        exit_price: formData.exit_price || 0,
        fees: formData.fees || 0,
        realized_pnl: formData.realized_pnl || 0,
        strategy: formData.strategy || '',
        hold_time_sec: formData.hold_time_sec || null,
        note: formData.note || '',
        mood: '', // Remove mood
        manual_tags: formData.manual_tags || '',
        screenshot_url: formData.screenshot_url || ''
      })
      
      setTrades([newTrade, ...trades])
      setShowForm(false)
      setFormData({
        trade_date: new Date().toISOString().split('T')[0],
        side: 'long',
        qty: 0,
        entry_price: 0,
        exit_price: 0,
        fees: 0,
        strategy: '',
        note: '',
        manual_tags: ''
      })
    } catch (err) {
      setError('Failed to create trade')
      console.error('Error creating trade:', err)
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        
        const csvData = []
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim())
            const row: any = {}
            headers.forEach((header, index) => {
              row[header.toLowerCase().replace(/\s+/g, '')] = values[index]
            })
            csvData.push(row)
          }
        }
        
        const importedTrades = await TradeService.importTradesFromCSV(csvData)
        setTrades([...importedTrades, ...trades])
        setShowImportModal(false)
      } catch (err) {
        setError('Failed to import CSV')
        console.error('Error importing CSV:', err)
      }
    }
    
    reader.readAsText(file)
  }

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTicker = !filterTicker || trade.ticker.toLowerCase().includes(filterTicker.toLowerCase())
    const matchesSide = filterSide === 'all' || trade.side === filterSide
    
    // Date range filtering
    let matchesDateRange = true
    if (filterDateRange !== 'all') {
      const tradeDate = new Date(trade.trade_date)
      const now = new Date()
      const daysAgo = filterDateRange === '7d' ? 7 : 
                     filterDateRange === '30d' ? 30 : 
                     filterDateRange === '90d' ? 90 : 365
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      matchesDateRange = tradeDate >= cutoffDate
    }
    
    // Tag filtering (AND logic - must have ALL selected tags)
    let matchesTag = true
    if (filterTag.length > 0) {
      const tradeTags = behavioralTags[trade.trade_id] || []
      const manualTags = trade.manual_tags ? trade.manual_tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t && t !== 'nan') : []
      const allTagLabels = [...tradeTags.map(t => t.label.toLowerCase()), ...manualTags]
      
      // Check if trade has ALL selected tags
      matchesTag = filterTag.every(selectedTag => 
        allTagLabels.some(tag => tag.includes(selectedTag.toLowerCase().trim()))
      )
    }
    
    return matchesSearch && matchesTicker && matchesSide && matchesDateRange && matchesTag
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.tag-dropdown')) {
        setShowTagDropdown(false)
      }
    }

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTagDropdown])

  const toggleTag = (tag: string) => {
    setFilterTag(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearAllTags = () => {
    setFilterTag([])
  }

  const totalPnL = filteredTrades.reduce((sum, t) => sum + t.realized_pnl, 0)
  const winRate = filteredTrades.length > 0 ? (filteredTrades.filter(t => t.realized_pnl > 0).length / filteredTrades.length) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto overflow-visible">
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
                <p className="text-slate-300 text-lg">
                  Track and analyze your trading performance
                  {trades.length > 0 && (
                    <span className="ml-2 text-primary-400">
                      ({filteredTrades.length} of {trades.length} trades shown)
                    </span>
                  )}
                </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary text-lg px-6 py-3 inline-flex items-center group"
            >
              <Upload className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Import CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary text-lg px-6 py-3 inline-flex items-center group"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Trade
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Filters */}
      <div className="card-glow mb-8 overflow-visible relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search trades..."
              />
            </div>
          </div>
          
          <div>
            <label className="label">Ticker</label>
            <input
              type="text"
              value={filterTicker}
              onChange={(e) => setFilterTicker(e.target.value.toUpperCase())}
              className="input"
              placeholder="AAPL"
            />
          </div>
          
          <div>
            <label className="label">Side</label>
            <select
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value as any)}
              className="input"
            >
              <option value="all">All Sides</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          
          <div className="relative tag-dropdown">
            <label className="label">Tags</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="input w-full text-left flex items-center justify-between"
              >
                <span className={filterTag.length > 0 ? 'text-white' : 'text-slate-400'}>
                  {filterTag.length === 0 ? 'Select tags...' : `Must have ${filterTag.length} tag(s)`}
                </span>
                <Tag className="h-4 w-4 text-slate-400" />
              </button>
              
              {showTagDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Available Tags</span>
                        <span className="text-xs text-primary-400">Must have ALL selected</span>
                      </div>
                      {filterTag.length > 0 && (
                        <button
                          onClick={clearAllTags}
                          className="text-xs text-danger-400 hover:text-danger-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {availableTags.map(tag => (
                      <label
                        key={tag}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filterTag.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-white">{tag}</span>
                      </label>
                    ))}
                    {availableTags.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        No tags available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Selected tags display */}
            {filterTag.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filterTag.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-300 border border-primary-500/30"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-1 text-primary-400 hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="label">Time Period</label>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="card-glow relative z-0">
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
                <th className="text-left py-4 px-6 text-slate-300 font-semibold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredTrades.map((trade, index) => (
                    <motion.tr
                      key={trade.trade_id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedTrade(trade)
                        setShowTradeDetails(true)
                      }}
                    >
                    <td className="py-4 px-6 text-slate-300">{trade.trade_date}</td>
                    <td className="py-4 px-6 font-semibold text-white">{trade.ticker}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.side === 'long'
                          ? 'bg-success-500/20 text-success-300'
                          : 'bg-danger-500/20 text-danger-300'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{trade.qty}</td>
                    <td className="py-4 px-6 text-slate-300">${trade.entry_price}</td>
                    <td className="py-4 px-6 text-slate-300">
                      {trade.exit_price ? `$${trade.exit_price}` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${
                        trade.realized_pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        ${trade.realized_pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {/* Manual tags */}
                        {trade.manual_tags ? trade.manual_tags.split(',').map((tag, tagIndex) => {
                          const cleanTag = tag.trim()
                          if (!cleanTag || cleanTag.toLowerCase() === 'nan') return null
                          return (
                            <span
                              key={`manual-${tagIndex}`}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30"
                            >
                              {cleanTag}
                            </span>
                          )
                        }) : null}
                        
                        {/* Behavioral tags from database */}
                        {behavioralTags[trade.trade_id]?.map((tag, tagIndex) => (
                          <span
                            key={`behavioral-${tagIndex}`}
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                              tag.color === 'success' ? 'from-success-500/20 to-emerald-500/20 text-success-300 border border-success-500/30' :
                              tag.color === 'danger' ? 'from-danger-500/20 to-red-500/20 text-danger-300 border border-danger-500/30' :
                              tag.color === 'warning' ? 'from-warning-500/20 to-yellow-500/20 text-warning-300 border border-warning-500/30' :
                              tag.color === 'primary' ? 'from-primary-500/20 to-blue-500/20 text-primary-300 border border-primary-500/30' :
                              'from-slate-500/20 to-slate-600/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center space-y-2">
                      <Search className="h-8 w-8 text-slate-500" />
                      <p>No trades match your current filters</p>
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setFilterTicker('')
                          setFilterSide('all')
                          setFilterDateRange('all')
                          setFilterTag([])
                        }}
                        className="text-primary-400 hover:text-primary-300 text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {hasMoreTrades && (
          <div className="flex justify-center py-6">
            <button
              onClick={loadMoreTrades}
              disabled={loading}
              className="btn btn-secondary px-8 py-3 inline-flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Load More Trades
                </>
              )}
            </button>
          </div>
        )}
        
        {!hasMoreTrades && trades.length > 0 && (
          <div className="text-center py-6 text-slate-400">
            <p>All trades loaded ({trades.length} total)</p>
          </div>
        )}
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
                      onChange={(e) => handleFormChange('side', e.target.value)}
                      className="input"
                      required
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      type="number"
                      value={formData.qty || ''}
                      onChange={(e) => handleFormChange('qty', Number(e.target.value))}
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
                      value={formData.entry_price || ''}
                      onChange={(e) => handleFormChange('entry_price', Number(e.target.value))}
                      className="input"
                      placeholder="185.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Exit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.exit_price || ''}
                      onChange={(e) => handleFormChange('exit_price', Number(e.target.value))}
                      className="input"
                      placeholder="192.30"
                    />
                  </div>
                  <div>
                    <label className="label">Fees (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fees || ''}
                      onChange={(e) => handleFormChange('fees', Number(e.target.value))}
                      className="input"
                      placeholder="2.50"
                    />
                  </div>
                  <div>
                    <label className="label">Strategy (Optional)</label>
                    <input
                      type="text"
                      value={formData.strategy || ''}
                      onChange={(e) => handleFormChange('strategy', e.target.value)}
                      className="input"
                      placeholder="Swing Trade"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    value={formData.note || ''}
                    onChange={(e) => handleFormChange('note', e.target.value)}
                    className="input h-24 resize-none"
                    placeholder="Trade notes, observations, lessons learned..."
                  />
                </div>
                <div>
                  <label className="label">Manual Tags</label>
                  <input
                    type="text"
                    value={formData.manual_tags || ''}
                    onChange={(e) => handleFormChange('manual_tags', e.target.value)}
                    className="input"
                    placeholder="tag1,tag2,tag3"
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

      {/* CSV Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-glow max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Import CSV File</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">CSV Format Requirements</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Your CSV file should have the following columns in order:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">1. Date</div>
                    <div className="text-slate-400">2. Ticker</div>
                    <div className="text-slate-400">3. Side</div>
                    <div className="text-slate-400">4. Quantity</div>
                    <div className="text-slate-400">5. Entry Price</div>
                    <div className="text-slate-400">6. Exit Price</div>
                    <div className="text-slate-400">7. Fees</div>
                    <div className="text-slate-400">8. Strategy</div>
                    <div className="text-slate-400">9. Notes</div>
                    <div className="text-slate-400">10. Mood</div>
                    <div className="text-slate-400">11. Status</div>
                    <div className="text-slate-400">12. Tags (pipe-separated)</div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">Choose a CSV file to import</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                    id="csv-import"
                  />
                  <label
                    htmlFor="csv-import"
                    className="btn btn-primary cursor-pointer"
                  >
                    Select CSV File
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Details Modal */}
      <AnimatePresence>
        {showTradeDetails && selectedTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTradeDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-glow max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Trade Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this trade?')) {
                        try {
                          await TradeService.deleteTrade(selectedTrade.trade_id)
                          setTrades(trades.filter(t => t.trade_id !== selectedTrade.trade_id))
                          setShowTradeDetails(false)
                        } catch (error) {
                          console.error('Error deleting trade:', error)
                        }
                      }
                    }}
                    className="btn btn-danger px-4 py-2 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowTradeDetails(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Trade Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date</label>
                    <p className="text-white">{selectedTrade.trade_date}</p>
                  </div>
                  <div>
                    <label className="label">Ticker</label>
                    <p className="text-white font-semibold">{selectedTrade.ticker}</p>
                  </div>
                  <div>
                    <label className="label">Side</label>
                    <p className="text-white">{selectedTrade.side.toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <p className="text-white">{selectedTrade.qty}</p>
                  </div>
                  <div>
                    <label className="label">Entry Price</label>
                    <p className="text-white">${selectedTrade.entry_price}</p>
                  </div>
                  <div>
                    <label className="label">Exit Price</label>
                    <p className="text-white">${selectedTrade.exit_price || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="label">Fees</label>
                    <p className="text-white">${selectedTrade.fees}</p>
                  </div>
                  <div>
                    <label className="label">P&L</label>
                    <p className={`font-semibold ${
                      selectedTrade.realized_pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                    }`}>
                      ${selectedTrade.realized_pnl.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Strategy and Notes */}
                {selectedTrade.strategy && (
                  <div>
                    <label className="label">Strategy</label>
                    <p className="text-white">{selectedTrade.strategy}</p>
                  </div>
                )}

                {selectedTrade.note && (
                  <div>
                    <label className="label">Notes</label>
                    <p className="text-white">{selectedTrade.note}</p>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="label">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {/* Manual tags */}
                    {selectedTrade.manual_tags ? selectedTrade.manual_tags.split(',').map((tag, tagIndex) => {
                      const cleanTag = tag.trim()
                      if (!cleanTag || cleanTag.toLowerCase() === 'nan') return null
                      return (
                        <span
                          key={`manual-${tagIndex}`}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30"
                        >
                          {cleanTag}
                        </span>
                      )
                    }) : null}
                    
                    {/* Behavioral tags */}
                    {behavioralTags[selectedTrade.trade_id]?.map((tag, tagIndex) => (
                      <span
                        key={`behavioral-${tagIndex}`}
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                          tag.color === 'success' ? 'from-success-500/20 to-emerald-500/20 text-success-300 border border-success-500/30' :
                          tag.color === 'danger' ? 'from-danger-500/20 to-red-500/20 text-danger-300 border border-danger-500/30' :
                          tag.color === 'warning' ? 'from-warning-500/20 to-yellow-500/20 text-warning-300 border border-warning-500/30' :
                          tag.color === 'primary' ? 'from-primary-500/20 to-blue-500/20 text-primary-300 border border-primary-500/30' :
                          'from-slate-500/20 to-slate-600/20 text-slate-300 border border-slate-500/30'
                        }`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Screenshot */}
                {selectedTrade.screenshot_url && (
                  <div>
                    <label className="label">Screenshot</label>
                    <img 
                      src={selectedTrade.screenshot_url} 
                      alt="Trade screenshot" 
                      className="max-w-full h-auto rounded-lg border border-slate-700/50"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
