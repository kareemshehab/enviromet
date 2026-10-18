/** Optional fixtures for the isolated local verification DB; never run on production. */
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.DATABASE_URI || process.env.DATABASE_URL !== 'file:./seo-verification.db') {
  throw new Error(
    'SEO fixtures require DATABASE_URL=file:./seo-verification.db and no DATABASE_URI',
  )
}

const payload = await getPayload({ config })
for (const [slug, published] of [
  ['seo-test-en-only', true],
  ['seo-test-draft', false],
] as const) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length) continue
  await payload.create({
    collection: 'pages',
    locale: 'en',
    draft: !published,
    context: { disableRevalidate: true },
    data: {
      title: 'SEO verification fixture',
      slug,
      _status: published ? 'published' : 'draft',
      layout: [{ blockType: 'pageIntro', heading: 'SEO verification fixture' }],
      meta: {
        title: `SEO verification ${slug}`,
        description: 'Temporary content in an isolated test database.',
      },
    },
  })
}
console.log('Isolated SEO fixtures ready')
await payload.destroy()
process.exit(0)
