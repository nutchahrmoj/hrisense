import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    error: 'Temporary production migration endpoint has been disabled.',
  }, { status: 410 })
}
