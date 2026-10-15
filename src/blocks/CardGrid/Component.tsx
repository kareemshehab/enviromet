import React from 'react'
import { pad } from '@/lib/links'
import { Eyebrow, Lines, sectionClass } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function CardGridBlock({ block }: { block: BlockData<'cardGrid'> }) {
  const items = block.items ?? []
  const grid =
    block.variant === 'pillars' ? (
      <div className="pillars">
        {items.map((it, i) => (
          <div key={i}>
            <h3>{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </div>
        ))}
      </div>
    ) : block.variant === 'certificates' ? (
      <div className="cert-grid">
        {items.map((it, i) => (
          <div key={i}>
            <span className="seal" aria-hidden="true">
              ✓
            </span>
            <h3>{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </div>
        ))}
      </div>
    ) : (
      <div className="lifecycle-grid">
        {items.map((it, i) => (
          <article key={i}>
            <span>{pad(i)}</span>
            <h3>{it.title}</h3>
            {it.text && <p>{it.text}</p>}
          </article>
        ))}
      </div>
    )
  return (
    <section className={sectionClass('section', block.background)} id={block.anchorId || undefined}>
      <div className="wrap">
        <Eyebrow text={block.eyebrow} />
        <h2>
          <Lines text={block.heading} />
        </h2>
        {grid}
        {block.note && <p className="small-note">{block.note}</p>}
      </div>
    </section>
  )
}
