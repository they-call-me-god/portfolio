import { NextRequest, NextResponse } from 'next/server'
import { runIteration } from '@/lib/iterate'

export const maxDuration = 60 // seconds

export async function POST(req: NextRequest) {
  // Validate Vercel Cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runIteration()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[iterate] Error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
