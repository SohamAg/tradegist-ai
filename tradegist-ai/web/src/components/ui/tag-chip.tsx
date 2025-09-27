'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagChipProps {
  label: string
  score?: number
  isPositive?: boolean
  className?: string
}

export function TagChip({ label, score, isPositive, className }: TagChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-xs font-medium rounded-full px-2 py-1',
        isPositive === true && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
        isPositive === false && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        className
      )}
    >
      {label}
      {score !== undefined && (
        <span className="ml-1 opacity-75">
          {score.toFixed(2)}
        </span>
      )}
    </Badge>
  )
}