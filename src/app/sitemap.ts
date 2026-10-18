import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/serverUrl'
import { getPublishedRoutes } from '@/lib/data'
import { languageAlternates, pagePath } from '@/lib/seo'

// Refresh after CMS changes and periodically if a revalidation hook was missed.
export const revalidate = 3600

/** /sitemap.xml generated from the CMS (English + Arabic pages). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [en, ar] = await Promise.all([getPublishedRoutes('en'), getPublishedRoutes('ar')])
  return (['en', 'ar'] as const).flatMap((locale) =>
    (locale === 'en' ? en : ar).map((route) => ({
      url: new URL(pagePath(route.slug, locale), serverURL).href,
      lastModified: route.updatedAt,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(route.slug, en, ar)).map(([language, path]) => [
            language,
            new URL(path, serverURL).href,
          ]),
        ),
      },
    })),
  )
}
