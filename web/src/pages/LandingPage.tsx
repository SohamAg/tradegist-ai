import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  BarChart3, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Cpu,
  Activity
} from 'lucide-react'
import DatabaseTest from '../components/DatabaseTest'

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your trading patterns and identify behavioral biases in real-time.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with interactive charts showing your trading performance and market trends.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BookOpen,
      title: 'Smart Journaling',
      description: 'Intelligent trade logging with automated insights, pattern recognition, and behavioral analysis.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get instant answers about your trading performance and personalized improvement suggestions.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Identify risky trading behaviors and get alerts to help protect your capital and improve discipline.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Discover what works best for your trading style and optimize your strategies with AI insights.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  const benefits = [
    'Identify and eliminate emotional trading patterns',
    'Track your progress with detailed analytics',
    'Get personalized insights from AI analysis',
    'Improve your trading discipline over time',
    'Reduce losses and maximize profits'
  ]

  const stats = [
    { value: '10,000+', label: 'Trades Analyzed', icon: Activity },
    { value: '95%', label: 'Accuracy Rate', icon: Target },
    { value: '24/7', label: 'AI Support', icon: Cpu }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-success-500/10 animate-gradient-xy"></div>
        
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 rounded-full mb-8">
              <Sparkles className="h-4 w-4 text-primary-400 mr-2" />
              <span className="text-sm font-semibold text-primary-300">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
              <span className="gradient-text">Master Your Trading</span>
              <br />
              <span className="text-white">with AI Intelligence</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your trading performance with advanced behavioral analysis, 
              intelligent journaling, and personalized AI coaching powered by cutting-edge technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/trades"
                className="btn btn-primary text-lg px-8 py-4 inline-flex items-center group"
              >
                Start Trading Journal
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/analytics"
                className="btn btn-secondary text-lg px-8 py-4"
              >
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Database Test Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto">
          <DatabaseTest />
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Everything You Need</span>
              <br />
              <span className="text-white">to Improve Your Trading</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with proven trading psychology principles 
              to deliver unprecedented insights into your trading behavior.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-glow group hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="card-glow max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Why Choose Tradegist AI?
            </h2>
            <p className="text-slate-300">
              Join thousands of traders who have transformed their performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start"
              >
                <CheckCircle className="h-6 w-6 text-success-400 mr-4 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Ready to Transform</span>
              <br />
              <span className="text-white">Your Trading?</span>
            </h2>
            <p className="text-lg text-slate-300 mb-12">
              Join thousands of traders who have improved their performance with AI-powered insights. 
              Start your journey to better trading today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/llm"
                className="btn btn-accent text-lg px-8 py-4 inline-flex items-center group"
              >
                Try AI Chat
                <MessageSquare className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/trades"
                className="btn btn-success text-lg px-8 py-4 inline-flex items-center group"
              >
                Log Your First Trade
                <BookOpen className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
