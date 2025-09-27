import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
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
    const trade_id = searchParams.get('id')

    if (!trade_id) {
      return NextResponse.json(
        { error: 'Trade ID is required' },
        { status: 400 }
      )
    }

    // Fetch the trade
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', trade_id)
      .eq('user_id', session.user.id)
      .single()

    if (tradeError || !trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // TODO: Replace with actual Python/Cedar analysis
    // For now, return mock behavior tags
    const mockBehaviors = [
      {
        behavior_code: 'disciplined_entry',
        confidence: 0.85,
        rationale: 'Entry price was within planned range and followed technical analysis'
      },
      {
        behavior_code: 'good_risk_management',
        confidence: 0.75,
        rationale: 'Position size was appropriate for account balance'
      }
    ]

    // Insert behavior tags
    const behaviorTags = mockBehaviors.map(behavior => ({
      user_id: session.user.id,
      trade_id,
      ...behavior
    }))

    const { data: insertedTags, error: insertError } = await supabase
      .from('trade_behavior_tags')
      .insert(behaviorTags)
      .select(`
        *,
        behaviors (*)
      `)

    if (insertError) {
      console.error('Error inserting behavior tags:', insertError)
      return NextResponse.json({ error: 'Failed to analyze trade' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      behaviors: insertedTags || []
    })

  } catch (error) {
    console.error('Trade analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}