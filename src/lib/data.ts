import 'server-only'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import config from '@payload-config'
import type { Page, Project, Service, SharedSection } from '@/payload-types'
import type { PublicRoute } from './seo'

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

async function findBySlug<T>(
  collection: 'pages' | 'services',
  slug: string,
  locale: Locale,
): Promise<T | null> {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const res = await payload.find({
    collection,
    where: draft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, publishedOnly] },
    draft,
    locale,
    fallbackLocale: false,
    depth: 2,
    limit: 1,
    pagination: false,
  })
  return (res.docs[0] as T) ?? null
}

export const getPageBySlug = cache(
  async (slug: string, locale: Locale = 'en'): Promise<Page | null> => {
    const page = await findBySlug<Page>('pages', slug, locale)
    // A page "exists" in a language only when it has content in that language.
    if (page && locale !== 'en' && !page.layout?.length) return null
    return page
  },
)

export const getServiceBySlug = cache(
  async (slug: string, locale: Locale = 'en'): Promise<Service | null> => {
    const service = await findBySlug<Service>('services', slug, locale)
    if (service && locale !== 'en' && !service.customLayout?.length) return null
    return service
  },
)

export const getAllProjects = cache(async (locale: Locale = 'en') => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'projects',
    sort: 'sortOrder',
    depth: 1,
    limit: 200,
    pagination: false,
    locale,
    fallbackLocale: false,
  })
  return res.docs
})

/** A project page; in Arabic only when it has an Arabic layout. */
export const getProjectBySlug = cache(
  async (slug: string, locale: Locale = 'en'): Promise<Project | null> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: false,
      depth: 1,
      limit: 1,
      pagination: false,
    })
    const project = res.docs[0] ?? null
    if (project && locale !== 'en' && !project.customLayout?.length) return null
    return project
  },
)

/** Published pages that editors placed in the main menu (Pages → "Show in menu"). */
export const getMenuPages = cache(async (locale: Locale = getRequestLocale()) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: {
      and: [{ menuColumn: { exists: true } }, { menuColumn: { not_equals: '' } }, publishedOnly],
    },
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
  async (
    id: number | string,
    locale: Locale = getRequestLocale(),
  ): Promise<SharedSection | null> => {
    const payload = await getPayloadClient()
    try {
      return await payload.findByID({
        collection: 'shared-sections',
        id,
        locale,
        fallbackLocale: false,
        depth: 2,
      })
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

/** Slugs that exist in a language (cached per request; used by the language switch). */
export const getLocaleSlugs = cache((locale: Locale) => getStaticSlugs(locale))

/** Public routes, including home. Never substitute English content for a missing translation. */
export const getPublishedRoutes = cache(async (locale: Locale = 'en'): Promise<PublicRoute[]> => {
  const payload = await getPayloadClient()
  const routes = new Map<string, PublicRoute>()
  // Match resolveSlug's precedence if collections contain the same slug.
  for (const collection of ['pages', 'services', 'projects'] as const) {
    let page = 1
    while (true) {
      const res = await payload.find({
        collection,
        ...(collection === 'projects' ? {} : { where: publishedOnly }),
        draft: false,
        locale,
        fallbackLocale: false,
        limit: 500,
        page,
        depth: 0,
        select: {
          slug: true,
          updatedAt: true,
          ...(locale === 'ar'
            ? collection === 'pages'
              ? { layout: true }
              : { customLayout: true }
            : {}),
        },
      })
      for (const doc of res.docs as (Page | Service | Project)[]) {
        const hasContent =
          locale === 'en' ||
          (collection === 'pages'
            ? (doc as Page).layout?.length
            : (doc as Service | Project).customLayout?.length)
        if (doc.slug && hasContent && !routes.has(doc.slug)) {
          routes.set(doc.slug, { slug: doc.slug, updatedAt: doc.updatedAt })
        }
      }
      if (!res.hasNextPage || !res.nextPage) break
      page = res.nextPage
    }
  }
  return [...routes.values()]
})

/** Slugs to pre-render at build time. Database errors must not become an empty sitemap. */
export const getStaticSlugs = async (locale: Locale = 'en') => {
  return (await getPublishedRoutes(locale))
    .filter(({ slug }) => slug !== 'home')
    .map(({ slug }) => slug)
}
