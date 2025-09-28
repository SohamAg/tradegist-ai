import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Bot, User, Sparkles, TrendingUp, AlertCircle, Zap, Brain, Activity, 
  FileText, Download, CheckSquare, Square, Filter, BarChart3, Target,
  MessageSquare, Settings, RefreshCw, Star, Award, TrendingDown, 
  Mic, MicOff, Volume2, VolumeX, Settings2, HelpCircle, BookOpen,
  Lightbulb, TrendingUp as TrendingUpIcon, AlertTriangle, CheckCircle
} from 'lucide-react'
// Cedar OS components temporarily disabled due to import issues
// import { ChatInput, ChatBubbles, FloatingChatInput } from 'cedar-os-components'
// import { useCedarStore, useRegisterState } from 'cedar-os'
import { TradeService } from '../services/tradeService'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  context?: any[]
}

interface Trade {
  trade_id: number
  ticker: string
  side: string
  trade_date: string
  realized_pnl: number
  mood?: string
  manual_tags?: string
}

interface BehavioralInsights {
  tagFrequency: any[]
  moodAnalysis: any
  timeAnalysis: any
  performanceData: any
  insights: string[]
  riskMetrics: any
  patterns: any[]
  starplotData: any[]
}

export default function LLMPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there! 👋 I'm your AI trading behavior coach. I'm here to help you understand your trading patterns, identify behavioral biases, and guide you toward more disciplined trading. I can analyze your trade history, mood patterns, and behavioral data to give you personalized insights. What would you like to explore about your trading behavior?",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTrades, setSelectedTrades] = useState<number[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [behavioralData, setBehavioralData] = useState<BehavioralInsights | null>(null)
  const [showContextWindow, setShowContextWindow] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const tradeService = new TradeService()

  // Cedar store integration temporarily disabled
  // const cedarMessages = useCedarStore((state) => state.messages)
  // const isProcessing = useCedarStore((state) => state.isProcessing)
  
  // Register state with Cedar temporarily disabled
  // useRegisterState('selectedTrades', selectedTrades, setSelectedTrades)
  // useRegisterState('trades', trades, setTrades)
  // useRegisterState('behavioralData', behavioralData, setBehavioralData)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadTradingData()
  }, [])

  const loadTradingData = async () => {
    try {
      const [tradesData, behavioralData] = await Promise.all([
        tradeService.getTrades(),
        tradeService.getBehavioralInsights()
      ])
      setTrades(tradesData)
      setBehavioralData(behavioralData)
    } catch (error) {
      console.error('Error loading trading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      context: selectedTrades.length > 0 ? 
        trades.filter(t => selectedTrades.includes(t.trade_id)) : 
        undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare comprehensive context for the AI
      const contextData = {
        selectedTrades: userMessage.context || [],
        behavioralInsights: behavioralData,
        allTrades: trades,
        prompt: input,
        // Add detailed behavioral analysis
        tagFrequency: behavioralData?.tagFrequency || [],
        moodAnalysis: behavioralData?.moodAnalysis || {},
        timeAnalysis: behavioralData?.timeAnalysis || {},
        performanceData: behavioralData?.performanceData || {},
        insights: behavioralData?.insights || [],
        riskMetrics: behavioralData?.riskMetrics || {},
        patterns: behavioralData?.patterns || [],
        starplotData: behavioralData?.starplotData || []
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: contextData
        })
      })

      const data = await response.json()
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickRequest = async (prompt: string) => {
    setInput(prompt)
    // Auto-submit the quick request
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  const generateComprehensiveReport = async () => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trades: trades,
          behavioralData: behavioralData
        })
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trading-behavior-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const toggleTradeSelection = (tradeId: number) => {
    setSelectedTrades(prev => {
      const newSelection = prev.includes(tradeId) 
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
      console.log('Selected trades:', newSelection) // Debug log
      return newSelection
    })
  }

  const clearAllSelections = () => {
    setSelectedTrades([])
  }

  const selectAllTrades = () => {
    const allTradeIds = trades.slice(0, 20).map(trade => trade.trade_id)
    setSelectedTrades(allTradeIds)
  }

  const quickPrompts = [
    "Analyze my recent trading patterns",
    "What behavioral biases do I have?",
    "How can I improve my discipline?",
    "Review my emotional trading patterns",
    "Suggest ways to reduce overtrading",
    "Analyze my risk management habits"
  ]

  const quickRequests = [
    {
      title: "Behavior Analysis",
      description: "Deep dive into your trading behavior patterns",
      icon: Brain,
      color: "from-purple-500 to-blue-500",
      action: () => handleQuickRequest("Provide a comprehensive analysis of my trading behavior patterns, including emotional triggers, decision-making processes, and areas for improvement.")
    },
    {
      title: "Mood Impact Study",
      description: "How your mood affects trading decisions",
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      action: () => handleQuickRequest("Analyze how my mood and emotional state correlate with my trading performance and decision quality.")
    },
    {
      title: "Risk Assessment",
      description: "Evaluate your risk management approach",
      icon: Target,
      color: "from-red-500 to-rose-500",
      action: () => handleQuickRequest("Assess my risk management practices and provide specific recommendations for improvement.")
    },
    {
      title: "Discipline Review",
      description: "Review your trading discipline and consistency",
      icon: Award,
      color: "from-yellow-500 to-orange-500",
      action: () => handleQuickRequest("Review my trading discipline, consistency in following rules, and suggest strategies to improve adherence to my trading plan.")
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 neon-glow">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                AI Trading Behavior Coach
              </h1>
              <p className="text-slate-300 text-lg">Personalized insights for better trading decisions</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowContextWindow(!showContextWindow)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Context ({selectedTrades.length})
            </button>
            <button
              onClick={generateComprehensiveReport}
              disabled={isGeneratingReport}
              className="btn btn-accent flex items-center gap-2"
            >
              {isGeneratingReport ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generate Report
            </button>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Context Window */}
      <AnimatePresence>
        {showContextWindow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 card-glow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-blue-400" />
                  Select Trades for Context ({selectedTrades.length} selected)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTrades}
                    className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {trades.slice(0, 20).map((trade) => {
                  const isSelected = selectedTrades.includes(trade.trade_id)
                  return (
                    <motion.div
                      key={trade.trade_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800/50 border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/50'
                      }`}
                      onClick={() => toggleTradeSelection(trade.trade_id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-400 mr-2" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-400 mr-2" />
                          )}
                          <span className="font-semibold text-white">{trade.ticker}</span>
                        </div>
                        <span className={`text-sm font-bold ${
                          trade.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${trade.realized_pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>{trade.side.toUpperCase()} • {new Date(trade.trade_date).toLocaleDateString()}</div>
                        {trade.mood && <div>Mood: {trade.mood}</div>}
                        {trade.manual_tags && <div>Tags: {trade.manual_tags}</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {selectedTrades.length > 0 && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    ✓ {selectedTrades.length} trades selected for context. The AI will analyze these specific trades along with your behavioral patterns.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="card h-[700px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 ml-4 neon-glow' 
                          : 'bg-gradient-to-r from-slate-700 to-slate-800 mr-4'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 text-white border border-slate-700/50'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-primary-100' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-2 text-xs text-blue-300">
                            📊 Context: {message.context.length} trades included
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 mr-4 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-success-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="border-t border-slate-700/50 p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickRequest(prompt)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-primary-500/20 hover:to-accent-500/20 border border-slate-700/50 hover:border-primary-500/50 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your trading behavior, patterns, or get personalized advice..."
                  className="flex-1 input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="btn btn-primary px-6 py-3 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Requests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-accent-400" />
              Quick Requests
            </h3>
            <div className="space-y-4">
              {quickRequests.map((request, index) => {
                const Icon = request.icon
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={request.action}
                    className={`w-full p-4 bg-gradient-to-r ${request.color}/10 border border-${request.color.split('-')[1]}-500/30 rounded-xl hover:${request.color}/20 transition-all duration-300 text-left`}
                  >
                    <div className="flex items-start">
                      <Icon className={`h-5 w-5 mr-3 mt-0.5 text-${request.color.split('-')[1]}-400`} />
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {request.title}
                        </p>
                        <p className="text-xs text-slate-300">
                          {request.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Behavioral Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-success-400" />
              Behavioral Insights
            </h3>
            <div className="space-y-4">
              {behavioralData?.insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl"
                >
                  <p className="text-sm text-slate-300">
                    {insight}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Assistant Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Settings2 className="h-5 w-5 mr-2 text-purple-400" />
              AI Assistant Features
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`w-full p-3 rounded-xl border transition-all duration-200 flex items-center ${
                  isVoiceEnabled 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                    : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-slate-500/50'
                }`}
              >
                {isVoiceEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                Voice Input {isVoiceEnabled ? 'Enabled' : 'Disabled'}
              </button>
              
              <button
                onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
                className="w-full p-3 rounded-xl border border-slate-600/50 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-200 flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Floating Chat
              </button>
              
              <button
                onClick={() => setShowContextWindow(!showContextWindow)}
                className={`w-full p-3 rounded-xl border transition-all duration-200 flex items-center ${
                  showContextWindow 
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-slate-500/50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Context Selection
              </button>
            </div>
          </motion.div>

          {/* Learning Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-yellow-400" />
              Learning Resources
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 rounded-xl border border-slate-600/50 text-slate-300 hover:border-yellow-500/50 hover:text-yellow-400 transition-all duration-200 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Trading Psychology Guide
              </button>
              
              <button className="w-full p-3 rounded-xl border border-slate-600/50 text-slate-300 hover:border-green-500/50 hover:text-green-400 transition-all duration-200 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Behavioral Tips
              </button>
              
              <button className="w-full p-3 rounded-xl border border-slate-600/50 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-200 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Discipline Strategies
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Floating Chat - Cedar OS component temporarily disabled */}
      {/* {isFloatingChatOpen && (
        <FloatingChatInput
          position={{ x: window.innerWidth - 400, y: 100 }}
          onClose={() => setIsFloatingChatOpen(false)}
          stream={true}
          width={350}
          className="custom-floating-input"
          autoFocus={false}
        />
      )} */}
    </div>
  )
}