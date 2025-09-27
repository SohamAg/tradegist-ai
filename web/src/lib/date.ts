import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns'

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export const formatDateTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy HH:mm')
}

export const formatTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm')
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

export const getCurrentDateTime = () => {
  return format(new Date(), 'EEEE, MMMM dd, yyyy • HH:mm')
}

export const isCurrentDay = (date: Date) => {
  return isToday(date)
}

export const isSameMonthAs = (date1: Date, date2: Date) => {
  return isSameMonth(date1, date2)
}

export const getDateRange = (days: number) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}