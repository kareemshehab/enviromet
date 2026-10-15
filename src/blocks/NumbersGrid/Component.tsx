import React from 'react'
import { Eyebrow, Lines, sectionClass } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function NumbersGridBlock({ block }: { block: BlockData<'numbersGrid'> }) {
  return (
    <section className={sectionClass('section', block.background)} id={block.anchorId || undefined}>
      <div className="wrap">
        <div className="center-heading">
          <Eyebrow text={block.eyebrow} />
          <h2>
            <Lines text={block.heading} />
          </h2>
        </div>
        <div className="project-numbers">
          {(block.items ?? []).map((it, i) => (
            <div key={i}>
              <strong>{it.value}</strong>
              <span>{it.label}</span>
            </div>
          ))}
        </div>
        {block.note && <p className="small-note">{block.note}</p>}
      </div>
    </section>
  )
}
