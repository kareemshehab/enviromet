/**
 * Public URL of the site.
 * - NEXT_PUBLIC_SERVER_URL when set (custom domain).
 * - On Vercel: the project's production domain (set automatically by Vercel).
 * - Locally: http://localhost:3000
 */
const configuredURL =
  process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')

// Canonicals and sitemap URLs use one origin, without accidental trailing slashes.
const parsedURL = new URL(configuredURL)
if (!['http:', 'https:'].includes(parsedURL.protocol))
  throw new Error('The public site URL must use HTTP or HTTPS')
export const serverURL = parsedURL.origin
