import React from 'react'
import { getGlobals, getRequestLocale } from '@/lib/data'
import { resolveHref, type LinkData } from '@/lib/links'
import { CMSLink, Lines, SmartLink } from '@/components/ui/primitives'

const ltr = (href?: string | null) => (href && /^(mailto:|tel:)/.test(href) ? { dir: 'ltr' as const } : {})

export async function SiteFooter() {
  const locale = getRequestLocale()
  const { footer, settings } = await getGlobals(locale)
  const contact = footer.contactColumn
  return (
    <footer className="sf">
      <div className="sf-rule" aria-hidden="true" />
      <div className="sf-wrap sf-top">
        <div className="sf-brand">
          <SmartLink className="sf-logo" href={locale === 'ar' ? '/ar' : '/'} aria-label={settings.siteName}>
            {/* White version of the logo for the dark footer (public/assets/logo-white.png) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-white.png" alt={settings.siteName} width={749} height={180} decoding="async" loading="lazy" />
          </SmartLink>
          {footer.tagline && (
            <p className="sf-tagline">
              <Lines text={footer.tagline} />
            </p>
          )}
          {settings.linkedinUrl && footer.linkedinLabel && (
            <a className="sf-social" href={settings.linkedinUrl} target="_blank" rel="noopener">
              {footer.linkedinLabel}
            </a>
          )}
        </div>

        <div className="sf-cols">
          {(footer.columns ?? []).map((col) => {
            const links = (col.links ?? []) as LinkData[]
            return (
              <div className="sf-col" key={col.id ?? col.heading} data-many={links.length > 6 || undefined}>
                <h2 className="sf-heading">{col.heading}</h2>
                <ul>
                  {links.map((link, i) => {
                    const href = resolveHref(link) ?? ''
                    return (
                      <li key={i}>
                        {/^(mailto:|tel:|https?:)/.test(href) ? (
                          <a href={href} {...ltr(href)} {...(link.newTab ? { target: '_blank', rel: 'noopener' } : {})}>
                            {link.label}
                          </a>
                        ) : (
                          <CMSLink link={link} />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
          {contact?.heading && (
            <div className="sf-col sf-contact">
              <h2 className="sf-heading">{contact.heading}</h2>
              <a className="sf-email" href={`mailto:${settings.email}`} dir="ltr">
                {settings.email}
              </a>
              {contact.locations && (
                <p className="sf-locations">
                  <Lines text={contact.locations} />
                </p>
              )}
              <CMSLink className="sf-enquiry" link={contact.link as LinkData} />
            </div>
          )}
        </div>
      </div>

      <div className="sf-wrap sf-bottom">
        <p className="sf-copy">
          © {new Date().getFullYear()} {settings.siteName}
          {footer.copyrightSuffix ? `. ${footer.copyrightSuffix}` : ''}
        </p>
        {!!footer.bottomLinks?.length && (
          <ul className="sf-legal">
            {footer.bottomLinks.map((l, i) => (
              <li key={i}>
                <CMSLink link={l as LinkData} />
              </li>
            ))}
          </ul>
        )}
        {footer.backToTopLabel && (
          <a className="sf-totop" href="#top">
            {footer.backToTopLabel}
          </a>
        )}
      </div>
    </footer>
  )
}
