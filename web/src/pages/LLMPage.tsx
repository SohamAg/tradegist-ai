import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, TrendingUp, AlertCircle, Zap, Brain, Activity } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function LLMPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI trading assistant powered by advanced machine learning. I can help you analyze your trading patterns, provide insights on your performance, identify behavioral biases, and suggest improvements. What would you like to know about your trading?",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand you're asking about your trading performance. Based on your recent trades, I can see some interesting patterns emerging. Your risk management has improved significantly, but I notice you tend to overtrade after losses. Would you like me to analyze specific aspects of your trading behavior or provide suggestions for improvement?",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const quickPrompts = [
    "Analyze my recent trading patterns",
    "What are my biggest weaknesses?",
    "Suggest improvements for my strategy",
    "Review my risk management",
    "Explain my behavioral biases",
    "Show me my performance metrics"
  ]

  const aiInsights = [
    {
      type: 'warning',
      title: 'Pattern Alert',
      message: 'You tend to overtrade after losses. Consider taking breaks.',
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      type: 'success',
      title: 'Strength Detected',
      message: 'Excellent risk management in morning trades.',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'info',
      title: 'AI Recommendation',
      message: 'Consider reducing position size during high volatility.',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 neon-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              AI Trading Assistant
            </h1>
            <p className="text-slate-300 text-lg">Get personalized insights and analysis</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-4">
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
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-primary-100' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
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
                    onClick={() => setInput(prompt)}
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
                  placeholder="Ask me anything about your trading..."
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
          {/* Trading Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-success-400" />
              Today's Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Trades</span>
                <span className="font-bold text-white text-lg">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">P&L</span>
                <span className="font-bold text-success-400 text-lg">+$1,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Win Rate</span>
                <span className="font-bold text-white text-lg">75%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risk Score</span>
                <span className="font-bold text-warning-400 text-lg">Low</span>
              </div>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-accent-400" />
              AI Insights
            </h3>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 bg-gradient-to-r ${insight.color}/10 border border-${insight.color}/30 rounded-xl`}
                  >
                    <div className="flex items-start">
                      <Icon className={`h-5 w-5 mr-3 mt-0.5 text-${insight.color.split('-')[1]}-400`} />
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {insight.title}
                        </p>
                        <p className="text-xs text-slate-300">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-glow"
          >
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn btn-secondary text-sm">
                Analyze Last Week
              </button>
              <button className="w-full btn btn-secondary text-sm">
                Review Risk Metrics
              </button>
              <button className="w-full btn btn-secondary text-sm">
                Generate Report
              </button>
              <button className="w-full btn btn-accent text-sm">
                Export Data
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
