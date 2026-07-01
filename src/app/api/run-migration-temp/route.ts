import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (token !== 'Hoh6BDtMpmaDMBQA') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sqlPath = path.join(process.cwd(), 'supabase/migrations/029_update_personnel_overview_view_and_seed.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = new Client({
    connectionString: 'postgresql://postgres:Hoh6BDtMpmaDMBQA@db.euybvugftjbezklgmxuw.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to remote database from serverless function')
    
    // Execute the seed SQL statements
    await client.query(sql)
    
    await client.end()
    return NextResponse.json({ success: true, message: 'Migration executed successfully from Vercel!' })
  } catch (err: any) {
    console.error(err)
    try { await client.end() } catch (e) {}
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 })
  }
}
