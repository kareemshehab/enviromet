'use client'
import { useField, useRowLabel } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Row = {
  hidden?: boolean
  blockName?: string
  heading?: string
  eyebrow?: string
  title?: string
  section?: number | string | { title?: string } | null
  items?: { blockType?: string; text?: string; items?: Row['items'] }[]
  slides?: { title?: string }[]
  custom?: { heading?: string }
  useDefault?: boolean
}

const firstLine = (s?: string | null) =>
  s
    ?.replace(/<[^>]+>/g, '')
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean)

/** First heading inside a generic Section (searches nested groups). */
const firstHeading = (items: Row['items']): string | undefined => {
  for (const it of items ?? []) {
    if (it.blockType === 'itemHeading' && it.text) return firstLine(it.text)
    const nested = firstHeading(it.items)
    if (nested) return nested
  }
}

/** Titles of shared sections, fetched once per id. */
const sharedTitles = new Map<string, Promise<string | undefined>>()
const loadSharedTitle = (id: string) => {
  if (!sharedTitles.has(id))
    sharedTitles.set(
      id,
      fetch(`/api/shared-sections/${id}?depth=0&draft=true`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.title as string | undefined)
        .catch(() => undefined),
    )
  return sharedTitles.get(id)!
}

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
    <path
      d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    {off && <path d="M3 17 17 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>
)

/**
 * Header of each section in the page editor:
 *   02  [Section]  Technical questions            [Hidden]  (eye button)
 * The eye button shows / hides the section on the website without opening it.
 */
export const SectionLabel = ({ blockLabel }: { blockLabel?: string }) => {
  const { data, path, rowNumber } = useRowLabel<Row>()
  const { value: hidden, setValue } = useField<boolean>({ path: `${path}.hidden` })
  const sharedId = data?.section && typeof data.section !== 'object' ? String(data.section) : null
  const [sharedTitle, setSharedTitle] = useState<string>()

  useEffect(() => {
    let live = true
    if (sharedId) loadSharedTitle(sharedId).then((t) => live && setSharedTitle(t))
    return () => {
      live = false
    }
  }, [sharedId])

  const title =
    data?.blockName ||
    (typeof data?.section === 'object' ? data.section?.title : sharedTitle) ||
    firstLine(data?.heading) ||
    firstLine(data?.title) ||
    firstLine(data?.slides?.[0]?.title) ||
    firstHeading(data?.items) ||
    firstLine(data?.custom?.heading) ||
    (data?.useDefault ? 'Default banner from Site Settings' : undefined) ||
    firstLine(data?.eyebrow)

  const isHidden = Boolean(hidden)

  return (
    <span className={`em-section-label${isHidden ? ' is-hidden' : ''}`}>
      <span className="em-section-label__num">{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
      <span className="em-section-label__type">{blockLabel}</span>
      {title && <span className="em-section-label__title">{title}</span>}
      {isHidden && <span className="em-section-label__badge">Hidden</span>}
      <button
        type="button"
        className="em-section-label__eye"
        aria-pressed={isHidden}
        aria-label={isHidden ? 'Show this section on the website' : 'Hide this section on the website'}
        title={isHidden ? 'Hidden on the website, click to show' : 'Visible on the website, click to hide'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setValue(!isHidden)
        }}
      >
        <EyeIcon off={isHidden} />
      </button>
    </span>
  )
}
