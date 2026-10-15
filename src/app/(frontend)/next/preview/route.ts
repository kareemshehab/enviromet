import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Enables Next.js draft mode for logged-in CMS editors, then redirects to the page.
 * Used by the admin panel's "Preview" button and the Live Preview iframe.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || '/'
  const secret = searchParams.get('secret')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview secret', { status: 403 })
  }
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return new Response('You must be logged in to the CMS to preview drafts', { status: 403 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
