'use client'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import { SmartLink } from '@/components/ui/primitives'
import { legacyToRoute } from '@/lib/routes'

export type NavLink = { label: string; href: string }
export type NavItem =
  | { kind: 'link'; label: string; href: string; className?: string | null; lang?: string | null }
  | { kind: 'menu'; label: string; id: string; columns: { heading: string; links: NavLink[] }[] }

type Props = {
  logo: { src: string; alt: string; width?: number; height?: number }
  items: NavItem[]
  cta?: NavLink | null
  language?: NavLink | null
  showSearch?: boolean
  locale?: 'en' | 'ar'
}

const strings = {
  en: {
    home: 'EnviroMET home',
    open: 'Open navigation',
    close: 'Close navigation',
    nav: 'Main navigation',
    homeHref: '/',
    search: 'Search the EnviroMET website',
    searchLabel: 'Search',
  },
  ar: {
    home: 'الرئيسية — EnviroMET',
    open: 'فتح القائمة',
    close: 'إغلاق القائمة',
    nav: 'القائمة الرئيسية',
    homeHref: '/ar',
    search: 'البحث في موقع EnviroMET',
    searchLabel: 'بحث',
  },
}

const normalise = (p: string) => legacyToRoute(p).split(/[?#]/)[0] || '/'

// The search dialog (and its index) is only downloaded when someone opens it.
const SearchDialog = dynamic(() => import('./SearchDialog.client').then((m) => m.SearchDialog), { ssr: false })

export function HeaderNav({ logo, items, cta, language, showSearch, locale = 'en' }: Props) {
  const t = strings[locale]
  const pathname = usePathname() || '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const isCurrent = (href: string) => normalise(href) === pathname
  // A page can be linked from several menus (e.g. /about): highlight only the first one.
  const currentMenu = items.find(
    (i) => i.kind === 'menu' && i.columns.some((c) => c.links.some((l) => isCurrent(l.href))),
  )

  // Close menus on route change (state adjusted during render, no effect needed)
  const [shownPath, setShownPath] = useState(pathname)
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpenMenu(null)
    setMobileOpen(false)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.sh-group')) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpenMenu(null)
      if (mobileOpen) {
        setMobileOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return (
    <>
      <header className="site-header sh">
        <div className="sh-shell">
          <SmartLink className="sh-brand" href={t.homeHref} aria-label={t.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} decoding="async" />
          </SmartLink>

          <button
            ref={toggleRef}
            className="sh-toggle"
            aria-expanded={mobileOpen}
            aria-controls="site-nav"
            aria-label={mobileOpen ? t.close : t.open}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sh-toggle-bars" aria-hidden="true" />
          </button>

          <div id="site-nav" className={mobileOpen ? 'sh-panel is-open' : 'sh-panel'}>
            <nav className="sh-nav" aria-label={t.nav}>
              {items.map((item) =>
                item.kind === 'link' ? (
                  <SmartLink
                    key={item.label}
                    href={item.href}
                    className="sh-link"
                    {...(item.lang ? { lang: item.lang, dir: item.lang === 'ar' ? 'rtl' : 'ltr' } : {})}
                    aria-current={isCurrent(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </SmartLink>
                ) : (
                  <div className="sh-group" key={item.id} data-cols={Math.min(item.columns.length, 3)}>
                    <button
                      className="sh-trigger"
                      aria-expanded={openMenu === item.id}
                      aria-controls={`sh-menu-${item.id}`}
                      data-current={currentMenu === item || undefined}
                      onClick={() => setOpenMenu((m) => (m === item.id ? null : item.id))}
                    >
                      {item.label}
                      <span className="sh-chevron" aria-hidden="true" />
                    </button>
                    <div className="sh-menu" id={`sh-menu-${item.id}`} hidden={openMenu !== item.id}>
                      {item.columns.map((col, ci) => (
                        <div className="sh-menu-col" key={col.heading}>
                          <p className="sh-menu-heading" id={`sh-menu-${item.id}-${ci}`}>
                            {col.heading}
                          </p>
                          <ul aria-labelledby={`sh-menu-${item.id}-${ci}`}>
                            {col.links.map((l) => (
                              <li key={l.href + l.label}>
                                <SmartLink href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
                                  {l.label}
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </nav>

            {(showSearch || language || cta) && (
              <div className="sh-tools">
                {showSearch && (
                  <button
                    className="sh-search"
                    aria-label={t.search}
                    onClick={() => {
                      setOpenMenu(null)
                      setSearchOpen(true)
                    }}
                  >
                    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
                      <circle cx="8.5" cy="8.5" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span className="sh-search-label">{t.searchLabel}</span>
                  </button>
                )}
                {language && (
                  <a
                    className="sh-lang"
                    href={language.href}
                    lang={locale === 'ar' ? 'en' : 'ar'}
                    dir={locale === 'ar' ? 'ltr' : 'rtl'}
                  >
                    {language.label}
                  </a>
                )}
                {cta && (
                  <SmartLink className="sh-cta" href={cta.href} aria-current={isCurrent(cta.href) ? 'page' : undefined}>
                    {cta.label}
                  </SmartLink>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  )
}
