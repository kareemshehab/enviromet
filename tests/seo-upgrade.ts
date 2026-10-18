/** Integration checks for existing CMS data, restricted to the disposable verification DB. */
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { upgradeUseCaseSEO } from '../src/seed/seo'
import { resolvePageDescription, useCaseDescriptions } from '../src/lib/useCaseSEO'

if (process.env.DATABASE_URI || process.env.DATABASE_URL !== 'file:./seo-verification.db') {
  throw new Error('SEO upgrade tests require the isolated seo-verification.db')
}
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const find = async (slug: string, locale: 'en' | 'ar') => {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: false,
    draft: false,
    limit: 1,
    depth: 0,
  })
  assert.ok(result.docs[0], `Missing seeded page ${slug}`)
  return result.docs[0]
}
const slugs = [
  'use-case-wind-campaign',
  'use-case-environmental-campaign',
  'use-case-technical-review',
  'use-case-water-assessment',
]
const originals = await Promise.all(
  slugs.flatMap((slug) =>
    (['en', 'ar'] as const).map(async (locale) => ({ locale, doc: await find(slug, locale) })),
  ),
)
const setDescription = async (slug: string, locale: 'en' | 'ar', description: string) => {
  const doc = await find(slug, locale)
  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale,
    data: { meta: { ...doc.meta, description }, _status: 'published' },
    context,
  })
}

try {
  await setDescription(
    'use-case-wind-campaign',
    'en',
    'An anonymous application of EnviroMET services.',
  )
  await setDescription(
    'use-case-wind-campaign',
    'ar',
    'تطبيق لخدمات EnviroMET دون ذكر هوية العميل.',
  )
  assert.equal(await upgradeUseCaseSEO(payload), 2)
  for (const locale of ['en', 'ar'] as const) {
    const doc = await find('use-case-wind-campaign', locale)
    const original = originals.find(
      (entry) => entry.locale === locale && entry.doc.slug === doc.slug,
    )!.doc
    assert.equal(doc.meta?.description, useCaseDescriptions[doc.slug][locale])
    assert.equal(doc.meta?.title, original.meta?.title)
    assert.equal(doc.meta?.image, original.meta?.image)
    assert.deepEqual(doc.layout, original.layout)
  }
  assert.equal(await upgradeUseCaseSEO(payload), 0, 'Upgrade must be idempotent')

  const custom = 'A summary explicitly written by the content editor.'
  await setDescription('use-case-environmental-campaign', 'en', custom)
  await setDescription(
    'use-case-environmental-campaign',
    'ar',
    'تطبيق لخدمات EnviroMET دون ذكر هوية العميل.',
  )
  assert.equal(await upgradeUseCaseSEO(payload), 1)
  assert.equal((await find('use-case-environmental-campaign', 'en')).meta?.description, custom)

  await setDescription(
    'use-case-technical-review',
    'en',
    'An anonymous application of EnviroMET services.',
  )
  const published = await find('use-case-technical-review', 'en')
  await payload.update({
    collection: 'pages',
    id: published.id,
    locale: 'en',
    draft: true,
    autosave: true,
    data: { title: 'Unpublished editor change', meta: { ...published.meta, description: custom } },
    context,
  })
  assert.equal(await upgradeUseCaseSEO(payload), 0)
  const stillPublished = await find('use-case-technical-review', 'en')
  assert.equal(stillPublished.title, published.title)
  assert.equal(stillPublished.meta?.description, published.meta?.description)
  assert.equal(
    resolvePageDescription(stillPublished.slug, 'en', stillPublished.meta?.description),
    useCaseDescriptions[stillPublished.slug].en,
  )
  const draft = await payload.findByID({
    collection: 'pages',
    id: published.id,
    locale: 'en',
    draft: true,
    depth: 0,
  })
  assert.equal(draft.title, 'Unpublished editor change')
  assert.equal(draft.meta?.description, custom)

  const water = await find('use-case-water-assessment', 'en')
  await payload.update({ collection: 'pages', id: water.id, data: { _status: 'draft' }, context })
  assert.equal(await upgradeUseCaseSEO(payload), 0)
  assert.equal((await find('use-case-water-assessment', 'en'))._status, 'draft')
  console.log(
    'SEO upgrade passed: localized replacement, idempotency, custom copy, draft preservation and unpublished status.',
  )
} finally {
  for (const { locale, doc } of originals) {
    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale,
      data: { title: doc.title, meta: doc.meta, _status: doc._status },
      context,
    })
  }
  await payload.destroy()
}
process.exit(0)
