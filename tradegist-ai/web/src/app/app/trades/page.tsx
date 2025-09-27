'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TagChip } from '@/components/ui/tag-chip'
import { Plus, Search, Filter } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/date'
import { Trade, BehaviorTag, Behavior } from '@/lib/types'

// Mock data - replace with real data fetching
const mockTrades: (Trade & { tags?: (BehaviorTag & { behavior: Behavior })[] })[] = [
  {
    id: '1',
    user_id: 'user1',
    symbol: 'AAPL',
    side: 'BUY',
    qty: 100,
    price: 150.25,
    opened_at: '2024-01-15T10:30:00Z',
    closed_at: '2024-01-15T15:45:00Z',
    fees: 2.50,
    pnl: 245.75,
    raw_hash: 'hash1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T15:45:00Z',
    tags: [
      {
        id: 'tag1',
        user_id: 'user1',
        trade_id: '1',
        behavior_code: 'disciplined_entry',
        confidence: 0.85,
        created_at: '2024-01-15T15:45:00Z',
        behavior: {
          code: 'disciplined_entry',
          label: 'Disciplined Entry',
          category: 'positive',
          is_positive: true
        }
      }
    ]
  },
  {
    id: '2',
    user_id: 'user1',
    symbol: 'TSLA',
    side: 'SELL',
    qty: 50,
    price: 245.80,
    opened_at: '2024-01-16T09:15:00Z',
    closed_at: '2024-01-16T14:20:00Z',
    fees: 1.75,
    pnl: -125.30,
    raw_hash: 'hash2',
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    tags: [
      {
        id: 'tag2',
        user_id: 'user1',
        trade_id: '2',
        behavior_code: 'revenge_trading',
        confidence: 0.75,
        created_at: '2024-01-16T14:20:00Z',
        behavior: {
          code: 'revenge_trading',
          label: 'Revenge Trading',
          category: 'negative',
          is_positive: false
        }
      }
    ]
  }
]

export default function TradesPage() {
  const [trades, setTrades] = useState(mockTrades)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrade, setSelectedTrade] = useState<typeof mockTrades[0] | null>(null)
  const supabase = createClient()

  const filteredTrades = trades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSideColor = (side: string) => {
    switch (side) {
      case 'BUY':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      case 'SELL':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      case 'SHORT':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'COVER':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (pnl < 0) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trades</h1>
          <p className="text-muted-foreground">
            Manage and analyze your trading history
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Symbol</th>
                  <th className="text-left p-4 font-medium">Side</th>
                  <th className="text-right p-4 font-medium">Qty</th>
                  <th className="text-right p-4 font-medium">Price</th>
                  <th className="text-right p-4 font-medium">PnL</th>
                  <th className="text-left p-4 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTrade(trade)}
                  >
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(trade.opened_at, 'MMM dd')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(trade.opened_at, 'HH:mm')}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{trade.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSideColor(trade.side)}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 text-right">{trade.qty}</td>
                    <td className="p-4 text-right">{formatCurrency(trade.price)}</td>
                    <td className={`p-4 text-right font-medium ${getPnLColor(trade.pnl || 0)}`}>
                      {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {trade.tags?.map((tag) => (
                          <TagChip
                            key={tag.id}
                            label={tag.behavior.label}
                            score={tag.confidence}
                            isPositive={tag.behavior.is_positive}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}