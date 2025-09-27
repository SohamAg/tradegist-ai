'use client'

import { CalendarPnL } from './calendar-pnl'
import { CalendarPnLData } from '@/lib/types'

interface CalendarPnLClientProps {
  data: CalendarPnLData[]
}

export function CalendarPnLClient({ data }: CalendarPnLClientProps) {
  const handleDayClick = (date: string) => {
    console.log('Day clicked:', date)
    // TODO: Navigate to trades for that day using client-side navigation
  }

  return <CalendarPnL data={data} onDayClick={handleDayClick} />
}