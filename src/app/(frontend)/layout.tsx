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

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>
}
