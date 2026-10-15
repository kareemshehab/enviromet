/**
 * Every page of the original static site now lives in the CMS.
 * Legacy file names map to clean routes:
 *   index.html → /        about.html → /about        project-x.html → /project-x
 *   ar-index.html → /ar   ar-about.html → /ar/about
 */
export function legacyToRoute(href: string): string {
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href)) return href
  const m = href.replace(/^\.?\//, '').match(/^([^?#]*)(.*)$/)
  if (!m) return href
  const [, file, rest] = m
  if (!file.endsWith('.html')) return (href.startsWith('/') ? href : `/${href}`)
  const name = file.slice(0, -5)
  if (name === 'index') return `/${rest}`
  if (name === 'ar-index') return `/ar${rest}`
  if (name === 'ar-procurement') return `/ar/for-procurement${rest}`
  if (name.startsWith('ar-')) return `/ar/${name.slice(3)}${rest}`
  return `/${name}${rest}`
}
