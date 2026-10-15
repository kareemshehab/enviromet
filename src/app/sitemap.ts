import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/serverUrl'
import { getStaticSlugs } from '@/lib/data'

/** /sitemap.xml generated from the CMS (English + Arabic pages). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverURL
  const [en, ar] = await Promise.all([getStaticSlugs('en'), getStaticSlugs('ar')])
  return [
    { url: `${base}/` },
    ...en.map((s) => ({ url: `${base}/${s}` })),
    { url: `${base}/ar` },
    ...ar.map((s) => ({ url: `${base}/ar/${s}` })),
  ]
}
