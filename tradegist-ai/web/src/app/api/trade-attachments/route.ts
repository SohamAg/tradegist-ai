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

    const body = await request.json()
    const { trade_id, type, url, text, emotion } = body

    // Validate required fields
    if (!trade_id || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const attachment = {
      user_id: session.user.id,
      trade_id,
      type,
      url: url || null,
      text: text || null,
      emotion: emotion || null,
      ts: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('trade_attachments')
      .insert(attachment)
      .select()
      .single()

    if (error) {
      console.error('Error creating attachment:', error)
      return NextResponse.json({ error: 'Failed to create attachment' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Attachment creation error:', error)
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
    const trade_id = searchParams.get('trade_id')

    let query = supabase
      .from('trade_attachments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('ts', { ascending: false })

    if (trade_id) {
      query = query.eq('trade_id', trade_id)
    }

    const { data: attachments, error } = await query

    if (error) {
      console.error('Error fetching attachments:', error)
      return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 })
    }

    return NextResponse.json({ data: attachments || [] })

  } catch (error) {
    console.error('Attachments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}