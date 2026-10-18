/** Run the targeted CMS content update inside Vercel, where production credentials stay private. */
import { upgradeUseCaseSEO } from '../src/seed/seo'
import { legacyUseCaseDescriptions, useCaseDescriptions } from '../src/lib/useCaseSEO'
import type { Page } from '../src/payload-types'

if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') {
  console.log('Production content update skipped outside Vercel production.')
  process.exit(0)
}

try {
  const uri = process.env.DATABASE_URI
  if (
    !uri?.startsWith('postgres') ||
    !process.env.PAYLOAD_SECRET ||
    process.env.PAYLOAD_SECRET === '[SENSITIVE]'
  ) {
    throw new Error('The production database and Payload secret must be configured.')
  }
  const target = new URL(uri)
  if (
    !target.hostname.endsWith('.supabase.co') &&
    !target.hostname.endsWith('.pooler.supabase.com')
  ) {
    throw new Error('The configured database is not a Supabase host.')
  }
  const project =
    target.hostname.match(/^db\.([^.]+)\.supabase\.co$/)?.[1] ||
    decodeURIComponent(target.username).split('.')[1] ||
    'configured production project'
  console.log(`Verifying SEO content on Supabase project ${project}.`)

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../src/payload.config'),
  ])
  const payload = await getPayload({ config })
  const updated = await upgradeUseCaseSEO(payload)
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { in: Object.keys(useCaseDescriptions) } },
    locale: 'all',
    fallbackLocale: false,
    draft: false,
    depth: 0,
    limit: 6,
  })
  let deferred = 0
  for (const page of docs) {
    if (page._status !== 'published') continue
    const meta = page.meta as unknown as Partial<Record<'en' | 'ar', Page['meta']>>
    const remaining = (['en', 'ar'] as const).some((locale) =>
      legacyUseCaseDescriptions.has(meta?.[locale]?.description?.trim() || ''),
    )
    if (!remaining) continue
    const latest = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: page.id } },
      sort: '-updatedAt',
      limit: 1,
      depth: 0,
    })
    if (latest.docs[0]?.version?._status !== 'draft') {
      throw new Error('A legacy description remained after the content update.')
    }
    deferred++
  }
  console.log(
    `Supabase SEO content verified: ${updated} descriptions updated; ${deferred} pages deferred to preserve drafts.`,
  )
  await payload.destroy()
  process.exit(0)
} catch {
  // Do not print connection errors that may contain production connection details.
  console.error(
    'Production SEO content verification failed. Deployment stopped; inspect the configured database and content before retrying.',
  )
  process.exit(1)
}
