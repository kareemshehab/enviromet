import 'server-only'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import config from '@payload-config'
import type { Page, Project, Service, SharedSection } from '@/payload-types'

export type Locale = 'en' | 'ar'

export const getPayloadClient = () => getPayload({ config })

/** Request-scoped locale: set once by the route ("/" = en, "/ar/…" = ar), read by any component. */
const localeStore = cache(() => ({ locale: 'en' as Locale }))
export const setRequestLocale = (locale: Locale) => {
  localeStore().locale = locale
}
export const getRequestLocale = (): Locale => localeStore().locale

/** True when an editor is previewing drafts (Live Preview / Preview button). */
export const isDraft = async () => (await draftMode()).isEnabled

const publishedOnly = { _status: { equals: 'published' } } as const

async function findBySlug<T>(collection: 'pages' | 'services', slug: string, locale: Locale): Promise<T | null> {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const res = await payload.find({
    collection,
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, publishedOnly] },
    draft,
    locale,
    fallbackLocale: false,
    depth: 2,
    limit: 1,
    pagination: false,
  })
  return (res.docs[0] as T) ?? null
}

export const getPageBySlug = cache(async (slug: string, locale: Locale = 'en'): Promise<Page | null> => {
  const page = await findBySlug<Page>('pages', slug, locale)
  // A page "exists" in a language only when it has content in that language.
  if (page && locale !== 'en' && !page.layout?.length) return null
  return page
})

export const getServiceBySlug = cache(async (slug: string, locale: Locale = 'en'): Promise<Service | null> => {
  const service = await findBySlug<Service>('services', slug, locale)
  if (service && locale !== 'en' && !service.customLayout?.length) return null
  return service
})

export const getAllProjects = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'projects', sort: 'sortOrder', depth: 1, limit: 200, pagination: false })
  return res.docs
})

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const projects = await getAllProjects()
  return projects.find((p) => p.slug === slug) ?? null
})

/** Published pages that editors placed in the main menu (Pages → "Show in menu"). */
export const getMenuPages = cache(async (locale: Locale = getRequestLocale()) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: { and: [{ menuColumn: { exists: true } }, { menuColumn: { not_equals: '' } }, publishedOnly] },
    locale,
    depth: 0,
    limit: 200,
    pagination: false,
    sort: 'title',
    select: { title: true, slug: true, menuColumn: true, menuLabel: true },
  })
  return res.docs
})

/** A section from the shared library, in the current request's language. */
export const getSharedSection = cache(
  async (id: number | string, locale: Locale = getRequestLocale()): Promise<SharedSection | null> => {
    const payload = await getPayloadClient()
    try {
      return await payload.findByID({ collection: 'shared-sections', id, locale, fallbackLocale: false, depth: 2 })
    } catch {
      return null // deleted or not found: the page simply skips it
    }
  },
)

/** Section order, visibility and shared text for every solution page. */
export const getSolutionTemplate = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'solution-template', depth: 1 })
})

export const getGlobals = cache(async (locale: Locale = getRequestLocale()) => {
  const payload = await getPayloadClient()
  const opts = { depth: 1, locale, fallbackLocale: false as const }
  const [header, footer, settings] = await Promise.all([
    payload.findGlobal({ slug: 'header', ...opts }),
    payload.findGlobal({ slug: 'footer', ...opts }),
    payload.findGlobal({ slug: 'site-settings', ...opts }),
  ])
  return { header, footer, settings }
})

/** Slugs to pre-render at build time. */
export const getStaticSlugs = async (locale: Locale = 'en') => {
  try {
    const payload = await getPayloadClient()
    const slugs: string[] = []
    for (const collection of ['pages', 'services'] as const) {
      const res = await payload.find({
        collection,
        where: publishedOnly,
        locale,
        fallbackLocale: false,
        limit: 500,
        pagination: false,
        depth: 0,
      })
      for (const d of res.docs as (Page | Service)[]) {
        const hasContent = locale === 'en' || ('layout' in d ? d.layout?.length : (d as Service).customLayout?.length)
        if (d.slug && d.slug !== 'home' && hasContent) slugs.push(d.slug)
      }
    }
    if (locale === 'en') slugs.push(...(await getAllProjects()).map((p) => p.slug).filter(Boolean))
    return [...new Set(slugs)]
  } catch {
    return []
  }
}
