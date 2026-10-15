import { serverURL } from './serverUrl'

/** URL used by the admin panel's Preview button and Live Preview iframe. */
export const previewURL = (collection: 'pages' | 'services', slug?: string | null) => {
  const path = !slug || slug === 'home' ? '/' : `/${slug}`
  const params = new URLSearchParams({
    collection,
    slug: slug || 'home',
    path,
    secret: process.env.PREVIEW_SECRET || '',
  })
  return `${serverURL}/next/preview?${params.toString()}`
}

export const livePreviewBreakpoints = [
  { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
  { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
]
