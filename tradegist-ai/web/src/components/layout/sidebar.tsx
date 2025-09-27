'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChartBar as BarChart3, Brain, ChevronLeft, ChevronRight, FileText, Hop as Home, MessageSquare, TrendingUp } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Trades', href: '/app/trades', icon: TrendingUp },
  { name: 'AI Insights', href: '/app/ai-insights', icon: BarChart3 },
  { name: 'LLM Agent', href: '/app/llm', icon: Brain },
  { name: 'Notes', href: '/app/notes', icon: FileText },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      'flex flex-col h-full bg-card border-r transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Tradegist</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10',
                  collapsed && 'px-2',
                  !collapsed && 'px-3'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4',
                  !collapsed && 'mr-3'
                )} />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}