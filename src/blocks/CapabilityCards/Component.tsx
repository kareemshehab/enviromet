import React from 'react'
import { asLink, pad } from '@/lib/links'
import { CMSLink, Eyebrow, Img, Lines, SmartLink } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function CapabilityCardsBlock({ block }: { block: BlockData<'capabilityCards'> }) {
  return (
    <section className="section refine-capabilities">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <Eyebrow text={block.eyebrow} />
            <h2>
              <Lines text={block.heading} />
            </h2>
          </div>
          <CMSLink link={asLink(block.headerLink)} appearance="text" />
        </div>
        <div className="refine-capability-grid">
          {(block.cards ?? []).map((card, i) => (
            <SmartLink key={i} className="refine-capability" href={card.url}>
              <figure>
                <Img media={card.image} alt={card.title} />
              </figure>
              <div>
                <p className="eyebrow">{pad(i)}</p>
                <h3>{card.title}</h3>
                {card.text && <p>{card.text}</p>}
                <span>{card.linkLabel || 'Explore capabilities'} ↗</span>
              </div>
            </SmartLink>
          ))}
        </div>
        {block.note && <p className="small-note">{block.note}</p>}
        {!!block.supportLinks?.length && (
          <div className="refine-support">
            {block.supportLinks.map((s, i) => (
              <SmartLink key={i} href={s.url}>
                <strong>{s.title}</strong>
                {s.text && <span>{s.text} ↗</span>}
              </SmartLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
