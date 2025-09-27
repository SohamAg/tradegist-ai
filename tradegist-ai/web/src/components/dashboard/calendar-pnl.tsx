'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { getMonthDays, formatCurrency, isCurrentDay, isSameMonthAs } from '@/lib/date'
import { cn } from '@/lib/utils'
import { CalendarPnLData } from '@/lib/types'

interface CalendarPnLProps {
  data: CalendarPnLData[]
  onDayClick?: (date: string) => void
}

export function CalendarPnL({ data, onDayClick }: CalendarPnLProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const monthDays = getMonthDays(currentMonth)
  const dataMap = new Map(data.map(item => [item.date, item]))

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return dataMap.get(dateStr)
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
    if (pnl < 0) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    return 'text-muted-foreground bg-muted/50'
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PnL Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(date => {
            const dayData = getDayData(date)
            const isToday = isCurrentDay(date)
            const isCurrentMonthDay = isSameMonthAs(date, currentMonth)
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onDayClick?.(format(date, 'yyyy-MM-dd'))}
                className={cn(
                  'p-2 text-xs rounded-lg transition-colors min-h-[60px] flex flex-col items-center justify-center',
                  'hover:bg-muted/50',
                  isToday && 'ring-2 ring-primary',
                  !isCurrentMonthDay && 'opacity-50',
                  dayData && getPnLColor(dayData.pnl)
                )}
              >
                <span className="font-medium">{format(date, 'd')}</span>
                {dayData && (
                  <>
                    <span className="text-[10px] font-semibold">
                      {formatCurrency(dayData.pnl)}
                    </span>
                    <span className="text-[9px] opacity-75">
                      {dayData.tradeCount} trades
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}