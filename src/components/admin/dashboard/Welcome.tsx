import React from 'react'
import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'

/**
 * Top of the admin dashboard (admin.components.beforeDashboard).
 * Server component: reads the CMS directly to show what needs attention
 * (new enquiries, unpublished changes), quick links and recent edits.
 */

type Props = { payload: Payload; user?: TypedUser | null }

type Row = {
  id: string | number
  title: string
  kind: 'Page' | 'Solution' | 'Project'
  href: string
  status: 'Published' | 'Draft' | 'Live'
  updatedAt: string
}

const A = '/admin'

const ago = (iso: string) => {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
  ]
  let v = diff
  for (const [size, unit] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit)
    v /= size
  }
  return rtf.format(Math.round(v), 'year')
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Pressure-chart contour lines: the meteorology in EnviroMET's name. Purely decorative. */
function Isobars() {
  const rings = [
    [70, 44, -12],
    [120, 78, -8],
    [175, 112, -4],
    [235, 150, 0],
    [300, 190, 4],
    [370, 232, 8],
    [445, 278, 12],
  ]
  return (
    <svg className="em-isobars" viewBox="0 0 900 420" aria-hidden="true" focusable="false">
      {rings.map(([rx, ry, rot], i) => (
        <ellipse key={i} cx="640" cy="210" rx={rx} ry={ry} transform={`rotate(${rot} 640 210)`} />
      ))}
      <text x="640" y="222" textAnchor="middle">
        H
      </text>
    </svg>
  )
}

export async function Welcome({ payload, user }: Props) {
  const draftQuery = { _status: { equals: 'draft' } } as const

  const [enquiries, pageDrafts, serviceDrafts, home, pages, services, projects] = await Promise.all([
    payload.find({
      collection: 'enquiries',
      where: { status: { equals: 'new' } },
      sort: '-createdAt',
      limit: 3,
      depth: 0,
    }),
    payload.find({ collection: 'pages', draft: true, where: draftQuery, sort: '-updatedAt', limit: 3, depth: 0 }),
    payload.find({ collection: 'services', draft: true, where: draftQuery, sort: '-updatedAt', limit: 3, depth: 0 }),
    payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 }),
    payload.find({ collection: 'pages', draft: true, sort: '-updatedAt', limit: 6, depth: 0 }),
    payload.find({ collection: 'services', draft: true, sort: '-updatedAt', limit: 6, depth: 0 }),
    payload.find({ collection: 'projects', sort: '-updatedAt', limit: 6, depth: 0 }),
  ])

  const drafts = [
    ...pageDrafts.docs.map((d) => ({ ...d, href: `${A}/collections/pages/${d.id}`, kind: 'Page' })),
    ...serviceDrafts.docs.map((d) => ({ ...d, href: `${A}/collections/services/${d.id}`, kind: 'Solution' })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3)
  const draftCount = pageDrafts.totalDocs + serviceDrafts.totalDocs

  const recent: Row[] = [
    ...pages.docs.map((d) => ({
      id: d.id,
      title: d.title,
      kind: 'Page' as const,
      href: `${A}/collections/pages/${d.id}`,
      status: d._status === 'draft' ? ('Draft' as const) : ('Published' as const),
      updatedAt: d.updatedAt,
    })),
    ...services.docs.map((d) => ({
      id: d.id,
      title: d.title,
      kind: 'Solution' as const,
      href: `${A}/collections/services/${d.id}`,
      status: d._status === 'draft' ? ('Draft' as const) : ('Published' as const),
      updatedAt: d.updatedAt,
    })),
    ...projects.docs.map((d) => ({
      id: d.id,
      title: d.title,
      kind: 'Project' as const,
      href: `${A}/collections/projects/${d.id}`,
      status: 'Live' as const,
      updatedAt: d.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)

  const homeId = home.docs[0]?.id
  const name = (user as { name?: string } | null | undefined)?.name || user?.email || ''
  const nothingWaiting = enquiries.totalDocs === 0 && draftCount === 0

  const quick = [
    { label: 'Home page', note: 'Hero slider, stats and featured sections', href: homeId ? `${A}/collections/pages/${homeId}` : `${A}/collections/pages` },
    { label: 'Menu and header', note: 'Navigation, highlighted button, language switch', href: `${A}/globals/header` },
    { label: 'Footer', note: 'Footer links, offices and copyright', href: `${A}/globals/footer` },
    { label: 'Contact details', note: 'Email, phone and the default closing banner', href: `${A}/globals/site-settings` },
    { label: 'Add a page', note: 'Start from one of the page templates', href: `${A}/collections/pages#new-page` },
    { label: 'Shared sections', note: 'Sections used on several pages: edit once', href: `${A}/collections/shared-sections` },
    { label: 'Solution pages (shared)', note: 'Section order and text for all solutions', href: `${A}/globals/solution-template` },
    { label: 'Add a project', note: 'Creates the project card and its detail page', href: `${A}/collections/projects/create` },
  ]

  return (
    <section className="em-dash" aria-labelledby="em-dash-title">
      <header className="em-dash__head">
        <Isobars />
        <div className="em-dash__intro">
          {name && <p className="em-dash__hello">Welcome back, {name}</p>}
          <h1 id="em-dash-title">EnviroMET website</h1>
          <p className="em-dash__lede">
            Edit pages, solutions and projects in English and Arabic. Changes appear on the website when you publish them.
          </p>
        </div>
        <div className="em-dash__site">
          <a href="/" target="_blank" rel="noopener">
            View website
          </a>
          <a href="/ar" target="_blank" rel="noopener" lang="ar" dir="rtl">
            الموقع العربي
          </a>
        </div>
      </header>
      <div className="em-dash__rule" aria-hidden="true" />

      <div className="em-dash__grid">
        <div className="em-panel">
          <h2>Needs attention</h2>
          {nothingWaiting ? (
            <p className="em-empty">
              Nothing is waiting. New enquiries from the contact form and drafts that are not yet published will appear here.
            </p>
          ) : (
            <>
              {enquiries.totalDocs > 0 && (
                <div className="em-flag">
                  <div className="em-flag__head">
                    <span className="em-dot em-dot--signal" aria-hidden="true" />
                    <strong>{plural(enquiries.totalDocs, 'new enquiry', 'new enquiries')}</strong>
                    <Link href={`${A}/collections/enquiries?where[status][equals]=new`}>Review enquiries</Link>
                  </div>
                  <ul>
                    {enquiries.docs.map((e) => (
                      <li key={e.id}>
                        <Link href={`${A}/collections/enquiries/${e.id}`}>{e.name}</Link>
                        <span>{e.service}</span>
                        <time dateTime={e.createdAt}>{ago(e.createdAt)}</time>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {draftCount > 0 && (
                <div className="em-flag">
                  <div className="em-flag__head">
                    <span className="em-dot em-dot--draft" aria-hidden="true" />
                    <strong>{plural(draftCount, 'draft not yet published', 'drafts not yet published')}</strong>
                  </div>
                  <ul>
                    {drafts.map((d) => (
                      <li key={`${d.kind}-${d.id}`}>
                        <Link href={d.href}>{d.title}</Link>
                        <span>{d.kind}</span>
                        <time dateTime={d.updatedAt}>{ago(d.updatedAt)}</time>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <nav className="em-panel" aria-label="Edit quickly">
          <h2>Edit quickly</h2>
          <ul className="em-quick">
            {quick.map((q) => (
              <li key={q.label}>
                <Link href={q.href}>
                  <span className="em-quick__label">{q.label}</span>
                  <span className="em-quick__note">{q.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {recent.length > 0 && (
        <div className="em-panel em-panel--wide">
          <h2>Recently edited</h2>
          <table className="em-recent">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Type</th>
                <th scope="col">Status</th>
                <th scope="col">Edited</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={`${r.kind}-${r.id}`}>
                  <td>
                    <Link href={r.href}>{r.title}</Link>
                  </td>
                  <td>{r.kind}</td>
                  <td>
                    <span className={`em-status em-status--${r.status.toLowerCase()}`}>{r.status}</span>
                  </td>
                  <td>
                    <time dateTime={r.updatedAt}>{ago(r.updatedAt)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
