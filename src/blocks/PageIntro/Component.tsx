import React from 'react'
import { Eyebrow, Lines } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function PageIntroBlock({ block }: { block: BlockData<'pageIntro'> }) {
  return (
    <section className="page-intro">
      <div className="wrap">
        <Eyebrow text={block.eyebrow} />
        <h1>
          <Lines text={block.heading} />
        </h1>
        {block.lede && <p className="lede">{block.lede}</p>}
      </div>
    </section>
  )
}
