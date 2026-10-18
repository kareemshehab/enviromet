import React from 'react'
import '@/styles/site.css'
import { draftMode } from 'next/headers'
import { SiteFooter } from './Footer'
import { SiteHeader } from './Header'
import { LivePreviewListener } from '@/components/preview/LivePreviewListener.client'
import { getGlobals, setRequestLocale, type Locale } from '@/lib/data'
import { StructuredData } from '@/components/StructuredData'
import { mediaUrl } from '@/lib/links'
import { serverURL } from '@/lib/serverUrl'

/**
 * Root <html> for the website (English and Arabic layouts).
 * Styles: src/styles/site.css (Tailwind CSS v4), bundled by Next.js.
 */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  setRequestLocale(locale)
  const { isEnabled: draft } = await draftMode()
  const { settings } = await getGlobals(locale)
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : undefined}>
      {/* suppressHydrationWarning: browser extensions add attributes to <body> */}
      <body id="top" suppressHydrationWarning>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${serverURL}/#organization`,
                name: settings.siteName,
                url: `${serverURL}/`,
                logo: mediaUrl(settings.logo)
                  ? new URL(mediaUrl(settings.logo)!, serverURL).href
                  : undefined,
                email: settings.email,
                telephone: settings.phone || undefined,
                sameAs: settings.linkedinUrl ? [settings.linkedinUrl] : undefined,
              },
              {
                '@type': 'WebSite',
                '@id': `${serverURL}/#website`,
                name: settings.siteName,
                url: `${serverURL}/`,
                inLanguage: ['en', 'ar'],
                publisher: { '@id': `${serverURL}/#organization` },
              },
            ],
          }}
        />
        <a className="skip" href="#main">
          {settings.skipLinkText || (locale === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content')}
        </a>
        {draft && <LivePreviewListener />}
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
