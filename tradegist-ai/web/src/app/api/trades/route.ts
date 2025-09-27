import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateRawHash } from '@/lib/utils'

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

    const body = await request.json()
    const { symbol, side, qty, price, opened_at, closed_at, fees, pnl } = body

    // Validate required fields
    if (!symbol || !side || !qty || !price || !opened_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const trade = {
      user_id: session.user.id,
      symbol: symbol.toUpperCase(),
      side,
      qty: parseFloat(qty),
      price: parseFloat(price),
      opened_at,
      closed_at: closed_at || null,
      fees: fees ? parseFloat(fees) : 0,
      pnl: pnl ? parseFloat(pnl) : null,
      raw_hash: generateRawHash(
        session.user.id,
        symbol.toUpperCase(),
        side,
        parseFloat(qty),
        parseFloat(price),
        opened_at,
        closed_at
      )
    }

    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single()

    if (error) {
      console.error('Error creating trade:', error)
      return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Trade creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const symbol = searchParams.get('symbol')
    const side = searchParams.get('side')
    
    let query = supabase
      .from('trades')
      .select(`
        *,
        trade_behavior_tags (
          *,
          behaviors (*)
        )
      `)
      .eq('user_id', session.user.id)
      .order('opened_at', { ascending: false })

    if (symbol) {
      query = query.ilike('symbol', `%${symbol}%`)
    }

    if (side) {
      query = query.eq('side', side)
    }

    const { data: trades, error } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching trades:', error)
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }

    return NextResponse.json({ data: trades || [] })

  } catch (error) {
    console.error('Trades fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}