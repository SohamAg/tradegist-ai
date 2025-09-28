import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  Home,
  TrendingUp,
  Zap
} from 'lucide-react'
import { clsx } from 'clsx'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'AI Chat', href: '/llm', icon: MessageSquare },
  { name: 'Trade Log', href: '/trades', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen tech-grid">
      {/* Navigation */}
      <nav className="glass-effect border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-3 neon-glow">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text">
                    Tradegist AI
                  </span>
                  <div className="text-xs text-slate-400 font-mono">v1</div>
                </div>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105',
                        isActive
                          ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center">
              <div className="flex items-center px-3 py-1 bg-success-500/20 border border-success-500/30 rounded-full mr-4">
                <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-success-300 font-mono">AI ONLINE</span>
              </div>
              <div className="text-sm text-slate-300">
                Welcome, <span className="text-white font-semibold">Soham</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
