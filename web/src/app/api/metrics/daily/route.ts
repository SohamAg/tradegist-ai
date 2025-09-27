import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    // Parse range (e.g., "30d" -> 30 days)
    const days = parseInt(range.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: metrics, error } = await supabase
      .from('metrics_daily')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching metrics:', error)
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }

    return NextResponse.json({ data: metrics || [] })

  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}