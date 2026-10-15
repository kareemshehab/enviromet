import React from 'react'
import type { Metadata, Viewport } from 'next'
import { SiteShell } from '@/components/layout/SiteShell'
import { serverURL } from '@/lib/serverUrl'

export const metadata: Metadata = {
  metadataBase: new URL(serverURL),
  icons: { icon: '/assets/favicon.svg' },
  robots: { index: false, follow: true },
}

export const viewport: Viewport = { themeColor: '#206687' }

/** Arabic site (/ar/…): same design, right-to-left, Arabic content from the CMS "ar" locale. */
export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ar">{children}</SiteShell>
}
