import type { Payload } from 'payload'
import { legacyUseCaseDescriptions, useCaseDescriptions } from '../lib/useCaseSEO'

/** Update only known placeholder copy. Never publish or overwrite an editor's pending draft. */
export async function upgradeUseCaseSEO(payload: Payload) {
  let updated = 0
  for (const [slug, descriptions] of Object.entries(useCaseDescriptions)) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      locale: 'all',
      fallbackLocale: false,
      draft: false,
      depth: 0,
      limit: 1,
    })
    const page = docs[0]
    if (!page || page._status !== 'published') continue
    const latest = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: page.id } },
      sort: '-updatedAt',
      limit: 1,
      depth: 0,
    })
    if (latest.docs[0]?.version?._status === 'draft') {
      payload.logger.info(
        `  SEO: preserving pending draft for ${slug}; public metadata uses the corrected copy`,
      )
      continue
    }
    for (const locale of ['en', 'ar'] as const) {
      // Payload's generated types describe one locale; locale: all returns localized groups.
      const meta = page.meta as unknown as
        | Partial<
            Record<
              'en' | 'ar',
              {
                title?: string | null
                description?: string | null
                image?: number | null
              }
            >
          >
        | null
        | undefined
      const current = meta?.[locale]
      if (!current?.description || !legacyUseCaseDescriptions.has(current.description.trim()))
        continue
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale,
        draft: false,
        data: { meta: { ...current, description: descriptions[locale] } },
        context: { disableRevalidate: true },
      })
      updated++
    }
  }
  payload.logger.info(`  SEO: updated ${updated} placeholder descriptions`)
  return updated
}
