/**
 * Public URL of the site.
 * - NEXT_PUBLIC_SERVER_URL when set (custom domain).
 * - On Vercel: the project's production domain (set automatically by Vercel).
 * - Locally: http://localhost:3000
 */
export const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
