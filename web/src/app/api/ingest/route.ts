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

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    let rowsProcessed = 0
    let rowsInserted = 0
    let rowsUpdated = 0

    // Log the ingest start
    const { data: ingestLog } = await supabase
      .from('ingest_log')
      .insert({
        user_id: session.user.id,
        filename: file.name,
        rows_processed: 0,
        rows_inserted: 0,
        rows_updated: 0,
        status: 'processing'
      })
      .select()
      .single()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Map CSV columns to database columns
      const trade = {
        user_id: session.user.id,
        symbol: row.symbol || row.ticker,
        side: row.side || row.action,
        qty: parseFloat(row.qty || row.quantity),
        price: parseFloat(row.price),
        opened_at: row.opened_at || row.date,
        closed_at: row.closed_at,
        fees: parseFloat(row.fees) || 0,
        pnl: parseFloat(row.pnl) || null,
        raw_hash: generateRawHash(
          session.user.id,
          row.symbol || row.ticker,
          row.side || row.action,
          parseFloat(row.qty || row.quantity),
          parseFloat(row.price),
          row.opened_at || row.date,
          row.closed_at
        )
      }

      // Upsert trade
      const { error } = await supabase
        .from('trades')
        .upsert(trade, { onConflict: 'raw_hash' })

      if (error) {
        console.error('Error upserting trade:', error)
      } else {
        rowsInserted++
      }

      rowsProcessed++
    }

    // Update ingest log
    await supabase
      .from('ingest_log')
      .update({
        rows_processed: rowsProcessed,
        rows_inserted: rowsInserted,
        rows_updated: rowsUpdated,
        status: 'completed'
      })
      .eq('id', ingestLog?.id)

    return NextResponse.json({
      success: true,
      rowsProcessed,
      rowsInserted,
      rowsUpdated
    })

  } catch (error) {
    console.error('Ingest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}