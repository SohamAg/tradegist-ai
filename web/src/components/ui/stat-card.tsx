'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video as LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className
}: StatCardProps) {
  return (
    <Card className={cn('rounded-2xl', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            'text-xs mt-1',
            changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            changeType === 'negative' && 'text-red-600 dark:text-red-400',
            changeType === 'neutral' && 'text-muted-foreground'
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}