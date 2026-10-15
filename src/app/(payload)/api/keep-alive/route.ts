import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/keep-alive: one small database read, called once a day by Vercel Cron (vercel.json).
 * Supabase's free plan pauses a project after a week without database activity; this keeps it awake.
 * Only Vercel's cron may call it: Vercel sends "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)
    return Response.json({ error: 'Not allowed' }, { status: 401 })

  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'pages' })
  return Response.json({ ok: true, pages: totalDocs, at: new Date().toISOString() })
}
