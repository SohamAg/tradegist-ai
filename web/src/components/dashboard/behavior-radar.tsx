'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { BehaviorInsight } from '@/lib/types'

interface BehaviorRadarProps {
  data: BehaviorInsight[]
}

export function BehaviorRadar({ data }: BehaviorRadarProps) {
  const chartData = data.map(item => ({
    behavior: item.label,
    score: item.avgScore * 100, // Convert to percentage for better visualization
    fullMark: 100
  }))

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Behavior Pattern Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="behavior" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Top Behaviors (Last 30 Days)</h4>
          <div className="space-y-1">
            {data.slice(0, 3).map((behavior, index) => (
              <div key={behavior.code} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {index + 1}. {behavior.label}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{behavior.count} times</span>
                  <span className="text-xs text-muted-foreground">
                    ({(behavior.avgScore * 100).toFixed(0)}% avg)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}