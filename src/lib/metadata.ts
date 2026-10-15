import type { Metadata } from 'next'
import type { Page, Project, Service } from '@/payload-types'
import { getGlobals, type Locale } from './data'
import { mediaUrl } from './links'

export async function buildMetadata(
  doc: Page | Service | Project | null,
  path: string,
  locale: Locale = 'en',
): Promise<Metadata> {
  const { settings } = await getGlobals(locale)
  const suffix = settings.titleSuffix ?? ' | EnviroMET'
  const base = doc?.meta?.title || doc?.title || settings.siteName
  // A full custom title ("… | EnviroMET Saudi Arabia") is used as-is.
  const title = base.includes('|') ? base : base + suffix
  const description = doc?.meta?.description || settings.defaultDescription || undefined
  const image = mediaUrl(doc?.meta?.image) || mediaUrl(settings.ogImage)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      siteName: settings.siteName,
      type: 'website',
      url: path,
      locale: locale === 'ar' ? 'ar_SA' : 'en_GB',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  }
}
