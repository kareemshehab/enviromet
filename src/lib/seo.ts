/** Pure SEO helpers shared by metadata, structured data and the sitemap. */
export type SiteLocale = 'en' | 'ar'
export type PublicRoute = { slug: string; updatedAt: string }

export function pagePath(slug: string, locale: SiteLocale): string {
  const path = slug === 'home' ? '' : `/${slug}`
  return locale === 'ar' ? `/ar${path}` : path || '/'
}

export function languageAlternates(slug: string, en: PublicRoute[], ar: PublicRoute[]) {
  const languages: Record<string, string> = {}
  if (en.some((route) => route.slug === slug)) languages.en = pagePath(slug, 'en')
  if (ar.some((route) => route.slug === slug)) languages.ar = pagePath(slug, 'ar')
  if (languages.en) languages['x-default'] = languages.en
  return languages
}

/** Preview deployments stay private even if production's opt-in is inherited. */
export function canIndexSite(env: NodeJS.ProcessEnv, url: string): boolean {
  const production = env.VERCEL_ENV
    ? env.VERCEL_ENV === 'production'
    : env.NODE_ENV === 'production'
  if (!production || env.SEARCH_ENGINE_INDEXING === 'false') return false
  const { hostname } = new URL(url)
  return !['localhost', '127.0.0.1', '[::1]'].includes(hostname) && !hostname.endsWith('.localhost')
}

/** A CMS value must never be able to close the JSON-LD script element. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
