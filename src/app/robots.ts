import type { MetadataRoute } from 'next'
import { serverURL } from '@/lib/serverUrl'
import { canIndexSite } from '@/lib/seo'

/** Public production sites can be crawled; development and Vercel previews cannot. */
export default function robots(): MetadataRoute.Robots {
  if (!canIndexSite(process.env, serverURL)) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${serverURL}/sitemap.xml`,
  }
}
