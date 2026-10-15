import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/serverUrl'

/**
 * Same as the original preview site: search engines are kept out until launch.
 * At launch, change `disallow` to `allow: '/'` (and remove `robots: noindex` in the layouts).
 */
export default function robots(): MetadataRoute.Robots {
  const base = serverURL
  return { rules: { userAgent: '*', disallow: '/' }, sitemap: `${base}/sitemap.xml` }
}
