'use client'
import React, { useState } from 'react'
import { SmartLink } from '@/components/ui/primitives'

export type Card = {
  title: string
  eyebrow?: string | null
  category?: string | null
  text?: string | null
  url: string
  image?: { src: string; srcSet?: string; alt: string; width?: number; height?: number } | null
}

type Props = {
  cards: Card[]
  linkLabel: string
  filter: 'none' | 'services' | 'cases'
  filters: string[]
  gridClass: string
  cardClass: string
  arrowSpan?: boolean
  hideImageLink?: boolean
}

/** Service / use-case cards with the original filter buttons and live count. */
export function CardsGridClient({ cards, linkLabel, filter, filters, gridClass, cardClass, arrowSpan, hideImageLink }: Props) {
  const all = filter === 'cases' ? 'All applications' : 'All services'
  const [active, setActive] = useState(all)
  const visible = (c: Card) => filter === 'none' || active === all || c.category === active
  const count = cards.filter(visible).length
  const noun = filter === 'cases' ? 'use case' : 'service'
  const dataAttr = (c: Card) =>
    c.category ? (filter === 'cases' ? { 'data-case-category': c.category } : { 'data-category': c.category }) : {}

  return (
    <>
      {filter !== 'none' && (
        <>
          <div className="filters" role="group" aria-label={filter === 'cases' ? 'Filter use cases' : 'Filter services'}>
            {[all, ...filters].map((f) => (
              <button
                key={f}
                className={`${filter === 'cases' ? 'case-filter ' : ''}filter${f === active ? ' active' : ' '}`}
                aria-pressed={f === active}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <p id={filter === 'cases' ? 'case-count' : 'filter-status'} className="small-note" aria-live="polite">
            {count} {noun}
            {count === 1 ? '' : 's'}
          </p>
        </>
      )}
      <div className={gridClass}>
        {cards.map((c) => (
          <article key={c.url + c.title} className={cardClass} {...dataAttr(c)} hidden={!visible(c)}>
            {c.image && (
              <SmartLink
                className="image-link"
                href={c.url}
                {...(hideImageLink ? { tabIndex: -1, 'aria-hidden': true } : {})}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image.src}
                  srcSet={c.image.srcSet}
                  sizes={c.image.srcSet ? '(max-width:760px) calc(100vw - 44px), (max-width:1279px) 50vw, 620px' : undefined}
                  alt={c.image.alt}
                  width={c.image.width}
                  height={c.image.height}
                  loading="lazy"
                  decoding="async"
                />
              </SmartLink>
            )}
            <div className="card-body">
              {c.eyebrow && <p className="eyebrow">{c.eyebrow}</p>}
              <h3>
                <SmartLink href={c.url}>{c.title}</SmartLink>
              </h3>
              {c.text && <p>{c.text}</p>}
              <SmartLink className="text-link" href={c.url}>
                {arrowSpan ? (
                  <>
                    {linkLabel} <span>↗</span>
                  </>
                ) : (
                  `${linkLabel} ↗`
                )}
              </SmartLink>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
