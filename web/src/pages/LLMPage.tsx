import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Bot, User, Sparkles, TrendingUp, AlertCircle, Zap, Brain, Activity, 
  FileText, Download, CheckSquare, Square, Filter, BarChart3, Target,
  MessageSquare, Settings, RefreshCw, Star, Award, TrendingDown, 
  Mic, MicOff, Volume2, VolumeX, Settings2, HelpCircle, BookOpen,
  Lightbulb, TrendingUp as TrendingUpIcon, AlertTriangle, CheckCircle
} from 'lucide-react'
// Voice functionality - simple implementation
// Cedar OS components have import issues, using custom voice solution
import { TradeService } from '../services/tradeService'
import ReactMarkdown from 'react-markdown'

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

  // Voice functionality state
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadTradingData()
    
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        handleSubmit(transcript)
        setIsListening(false)
      }
      
      recognitionInstance.onerror = () => {
        setIsListening(false)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  const loadTradingData = async () => {
    try {
      console.log('Loading trading data...')
      // Load trades using the same method as TradeLogPage
      const tradesData = await TradeService.getTrades(5000, 0)
      console.log('Loaded trades for LLM:', tradesData.length, 'trades')
      console.log('Sample trade:', tradesData[0])
      
      // Load behavioral insights
      const behavioralData = await TradeService.getBehavioralInsights()
      console.log('Loaded behavioral data:', behavioralData)
      
      setTrades(tradesData)
      setBehavioralData(behavioralData)
    } catch (error) {
      console.error('Error loading trading data:', error)
    }
  }

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
      context: selectedTrades.length > 0 ? 
        trades.filter(t => selectedTrades.includes(t.trade_id)) : 
        undefined
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Prepare comprehensive context for the AI
      const contextData = {
        selectedTrades: userMessage.context || [],
        behavioralInsights: behavioralData,
        allTrades: trades,
        prompt: message,
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
          message: message,
          context: contextData,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
    // Directly submit the quick request
    await handleSubmit(prompt)
  }

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser')
      return
    }
    
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const generateComprehensiveReport = async () => {
    setIsGeneratingReport(true)
    try {
      console.log('Generating report with trades:', trades.length)
      
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      console.log('PDF blob received, size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trading-behavior-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('PDF download initiated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      alert(`Failed to generate report: ${error.message}`)
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
    const allTradeIds = trades.slice(0, 50).map(trade => trade.trade_id)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-full mx-auto px-2 py-4">
        {/* Enhanced Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mr-6 shadow-2xl shadow-purple-500/25">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                  AI Trading Behavior Coach
                </h1>
                <p className="text-slate-300 text-lg">Personalized insights for better trading decisions</p>
                <p className="text-slate-400 text-sm">Trades loaded: {trades.length}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowContextWindow(!showContextWindow)}
                className="px-5 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <Filter className="h-4 w-4" />
                Context ({selectedTrades.length})
              </button>
              <button
                onClick={generateComprehensiveReport}
                disabled={isGeneratingReport}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
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
            className="mb-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <CheckSquare className="h-7 w-7 mr-3 text-blue-400" />
                  Select Trades for Context ({selectedTrades.length} selected)
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={selectAllTrades}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-400 rounded-xl transition-colors border border-blue-500/30 shadow-lg"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-400 rounded-xl transition-colors border border-red-500/30 shadow-lg"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-96 overflow-y-auto">
                {trades.length === 0 ? (
                  <div className="col-span-full text-center text-slate-400 py-8">
                    <p>Loading trades...</p>
                    <p className="text-sm mt-2">Total trades: {trades.length}</p>
                  </div>
                ) : (
                  trades.slice(0, 50).map((trade) => {
                  const isSelected = selectedTrades.includes(trade.trade_id)
                  return (
                    <motion.div
                      key={trade.trade_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-blue-500/20'
                          : 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/80'
                      }`}
                      onClick={() => toggleTradeSelection(trade.trade_id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {isSelected ? (
                            <CheckSquare className="h-6 w-6 text-blue-400 mr-3" />
                          ) : (
                            <Square className="h-6 w-6 text-slate-400 mr-3" />
                          )}
                          <span className="font-bold text-white text-lg">{trade.ticker}</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          trade.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${trade.realized_pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 space-y-2">
                        <div className="font-medium">{trade.side.toUpperCase()} • {new Date(trade.trade_date).toLocaleDateString()}</div>
                        {trade.mood && <div>Mood: <span className="text-slate-300">{trade.mood}</span></div>}
                        {trade.manual_tags && <div>Tags: <span className="text-slate-300">{trade.manual_tags}</span></div>}
                      </div>
                    </motion.div>
                  )
                })
                )}
              </div>
              
              {selectedTrades.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl shadow-lg">
                  <p className="text-base text-blue-300 font-medium">
                    ✓ {selectedTrades.length} trades selected for context. The AI will analyze these specific trades along with your behavioral patterns.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {/* Enhanced Chat Interface - Full Width */}
        <div className="w-full">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl h-[calc(100vh-150px)] flex flex-col overflow-hidden">
            {/* Messages Area - Larger */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[95%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-12 h-12 rounded-3xl flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 ml-6' 
                          : 'bg-gradient-to-r from-slate-700 to-slate-800 mr-6'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-6 w-6 text-white" />
                        ) : (
                          <Bot className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className={`rounded-3xl px-6 py-4 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-white border border-slate-700/50 backdrop-blur-sm'
                      }`}>
                        {message.role === 'user' ? (
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="text-base leading-relaxed prose prose-invert prose-slate max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                                h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                                h3: ({children}) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                                p: ({children}) => <p className="text-slate-200 mb-3">{children}</p>,
                                strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                                em: ({children}) => <em className="text-slate-300 italic">{children}</em>,
                                code: ({children}) => <code className="bg-slate-700 text-green-400 px-2 py-1 rounded text-sm">{children}</code>,
                                ul: ({children}) => <ul className="list-disc list-inside text-slate-200 mb-3 space-y-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside text-slate-200 mb-3 space-y-1">{children}</ol>,
                                li: ({children}) => <li className="text-slate-200">{children}</li>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-300 my-4">{children}</blockquote>
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <p className={`text-sm mt-3 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-3 text-sm text-blue-300 bg-blue-500/20 px-3 py-2 rounded-lg">
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
                    <div className="w-12 h-12 rounded-3xl bg-gradient-to-r from-slate-700 to-slate-800 mr-6 flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-3xl px-8 py-6 backdrop-blur-sm">
                      <div className="flex space-x-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area */}
            <div className="border-t border-slate-700/50 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-3 mb-4">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickRequest(prompt)}
                    className="px-6 py-3 text-sm bg-gradient-to-r from-slate-700/80 to-slate-800/80 hover:from-blue-500/30 hover:to-purple-500/30 border border-slate-600/50 hover:border-blue-500/50 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Input Form with Voice */}
              <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSubmit(input); setInput('') }} className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your trading behavior, patterns, or get personalized advice..."
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={!recognition || isLoading}
                  className={`px-4 py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg flex items-center gap-2 ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white animate-pulse' 
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/25 flex items-center gap-3"
                >
                  <Send className="h-6 w-6" />
                </button>
              </form>
              
              {/* Context Badge */}
              {selectedTrades.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                    {selectedTrades.length} trades selected
                  </span>
                  <button
                    onClick={clearAllSelections}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  )
}