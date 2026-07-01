import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

async function tryConnect(host: string, sql: string) {
  const client = new Client({
    host: host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Hoh6BDtMpmaDMBQA',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  try {
    console.log(`Connecting to database at ${host}...`)
    await client.connect()
    console.log('SUCCESS! Connected to DB.')
    await client.query(sql)
    await client.end()
    return { success: true }
  } catch (err: any) {
    console.error(`Failed connecting to ${host}:`, err.message)
    try { await client.end() } catch (e) {}
    return { success: false, error: err.message }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (token !== 'Hoh6BDtMpmaDMBQA') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sqlPath = path.join(process.cwd(), 'supabase/migrations/029_update_personnel_overview_view_and_seed.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Try direct hostname first
  const res1 = await tryConnect('db.euybvugftjbezklgmxuw.supabase.co', sql)
  if (res1.success) {
    return NextResponse.json({ success: true, message: 'Migration executed via hostname!' })
  }

  // Try raw IPv6 address
  const res2 = await tryConnect('2406:da14:1d62:b402:475c:4c47:2d63:f58', sql)
  if (res2.success) {
    return NextResponse.json({ success: true, message: 'Migration executed via raw IPv6 address!' })
  }

  return NextResponse.json({
    success: false,
    errors: {
      hostname: res1.error,
      ipv6: res2.error
    }
  }, { status: 500 })
}
