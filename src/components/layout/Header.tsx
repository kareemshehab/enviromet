import React from 'react'
import { getGlobals, getMenuPages, getRequestLocale } from '@/lib/data'
import { asMedia, resolveHref, type LinkData } from '@/lib/links'
import { formatSlug } from '@/lib/slug'
import { HeaderNav, type NavItem } from './HeaderNav.client'

const toNavLink = (l?: LinkData | null) => {
  const href = resolveHref(l)
  return l && href && l.label ? { label: l.label, href } : null
}

/** Server component: loads the menu from the CMS; HeaderNav (client) adds the interactive behaviour. */
export async function SiteHeader() {
  const locale = getRequestLocale()
  const [{ header, settings }, menuPages] = await Promise.all([getGlobals(locale), getMenuPages(locale)])
  const logo = asMedia(settings.logo)
  let items: NavItem[] = (header.navItems ?? []).map((item) =>
    item.kind === 'link'
      ? { kind: 'link', label: item.label, href: item.url || '/', className: item.className, lang: item.lang }
      : {
          kind: 'menu',
          label: item.label,
          id: formatSlug(item.label) || item.id || 'menu',
          columns: (item.columns ?? []).map((c) => {
            const links = (c.links ?? [])
              .map((l) => toNavLink(l as LinkData))
              .filter((x): x is NonNullable<typeof x> => Boolean(x))
            // Pages placed in this column from the page editor ("Show in menu"), unless already listed.
            for (const p of menuPages)
              if (c.id && p.menuColumn === c.id && p.slug) {
                const href = `/${p.slug}`
                if (!links.some((l) => l.href === href)) links.push({ label: p.menuLabel || p.title, href })
              }
            return { heading: c.heading, links }
          }),
        },
  )

  // The Arabic header (imported from the original site) keeps its contact link and its
  // "English" switch as ordinary nav links. Show them in the same places as the English
  // header: the contact link as the highlighted button, the language link next to it.
  let cta = toNavLink(header.cta as LinkData)
  let language = toNavLink(header.languageLink as LinkData)
  if (!language) {
    const lang = items.find((i) => i.kind === 'link' && (i.lang || i.className?.includes('language-switch')))
    if (lang && lang.kind === 'link') {
      language = { label: lang.label, href: lang.href }
      items = items.filter((i) => i !== lang)
    }
  }
  if (!cta) {
    const contact = items.find((i) => i.kind === 'link' && /\/contact\/?$/.test(i.href))
    if (contact && contact.kind === 'link') {
      cta = { label: contact.label, href: contact.href }
      items = items.filter((i) => i !== contact)
    }
  }

  return (
    <>
      {settings.utilityText && (
        <div className="utility">
          <div className="wrap">
            <span>{settings.utilityText}</span>
            <a href={`mailto:${settings.email}`}>{settings.email} ↗</a>
          </div>
        </div>
      )}
      <HeaderNav
        locale={locale}
        logo={{
          src: logo?.url ?? '/assets/logo.png',
          alt: logo?.alt ?? settings.siteName,
          width: logo?.width ?? undefined,
          height: logo?.height ?? undefined,
        }}
        items={items}
        cta={cta}
        language={language}
        showSearch={header.showSearch ?? true}
      />
    </>
  )
}
