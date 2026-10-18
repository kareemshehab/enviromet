import type { Metadata } from 'next'
import type { Page, Project, Service } from '@/payload-types'
import { getGlobals, getPublishedRoutes, isDraft, type Locale } from './data'
import { asMedia, mediaUrl } from './links'
import { canIndexSite, languageAlternates } from './seo'
import { serverURL } from './serverUrl'
import { resolvePageDescription } from './useCaseSEO'

export async function buildMetadata(
  doc: Page | Service | Project | null,
  path: string,
  locale: Locale = 'en',
): Promise<Metadata> {
  const [{ settings }, en, ar, draft] = await Promise.all([
    getGlobals(locale),
    getPublishedRoutes('en'),
    getPublishedRoutes('ar'),
    isDraft(),
  ])
  const suffix = settings.titleSuffix ?? ' | EnviroMET'
  const base = doc?.meta?.title?.trim() || doc?.title?.trim() || settings.siteName
  // A full custom title ("… | EnviroMET Saudi Arabia") is used as-is.
  const title = base.includes('|') ? base : base + suffix
  const description =
    resolvePageDescription(doc?.slug, locale, doc?.meta?.description) ||
    settings.defaultDescription ||
    undefined
  const image = mediaUrl(doc?.meta?.image) || mediaUrl(settings.ogImage)
  const imageData = asMedia(doc?.meta?.image) || asMedia(settings.ogImage)
  const slug = doc?.slug || 'home'
  return {
    title,
    description,
    robots: { index: Boolean(doc) && !draft && canIndexSite(process.env, serverURL), follow: true },
    alternates: { canonical: path, languages: doc ? languageAlternates(slug, en, ar) : undefined },
    openGraph: {
      title,
      description,
      siteName: settings.siteName,
      type: 'website',
      url: path,
      locale: locale === 'ar' ? 'ar_SA' : 'en_GB',
      images: image
        ? [
            {
              url: image,
              alt: imageData?.alt || title,
              ...(imageData?.width ? { width: imageData.width } : {}),
              ...(imageData?.height ? { height: imageData.height } : {}),
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}
