import React from 'react'
import { asLinks } from '@/lib/links'
import { Eyebrow, LinkGroup, Lines, sectionClass } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function ActionsBlock({ block }: { block: BlockData<'actions'> }) {
  return (
    <section className={sectionClass('section', block.background)}>
      <div className="wrap">
        <Eyebrow text={block.eyebrow} id={block.anchorId || undefined} />
        <h2>
          <Lines text={block.heading} />
        </h2>
        <LinkGroup links={asLinks(block.links)} forceWrap />
      </div>
    </section>
  )
}
