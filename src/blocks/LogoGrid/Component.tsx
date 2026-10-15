import React from 'react'
import type { Media } from '@/payload-types'
import { asLink } from '@/lib/links'
import { CMSLink, Eyebrow, Img, Lines, SmartLink } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function LogoGridBlock({ block }: { block: BlockData<'logoGrid'> }) {
  const partners = block.variant === 'partners'
  const logos = block.logos ?? []
  return (
    <section className={partners ? 'section reference-ecosystem' : 'section refine-customers'}>
      <div className="wrap">
        <div className="center-heading">
          <Eyebrow text={block.eyebrow} />
          <h2>
            <Lines text={block.heading} />
          </h2>
          {block.intro && <p>{block.intro}</p>}
        </div>
        {partners ? (
          <div className="partner-logo-grid refine-partners">
            {logos.map((l, i) =>
              l.url ? (
                <SmartLink key={i} href={l.url}>
                  <Img media={l.image} alt={l.label} />
                </SmartLink>
              ) : (
                <div key={i} className="partner-logo">
                  <Img media={l.image} alt={l.label} />
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="customer-logo-grid">
            {logos.map((l, i) => (
              <div key={i} className="logo-only">
                <Img media={l.image} alt={l.label} />
                {l.secondImage && <Img media={l.secondImage} className="joint-logo" alt={(l.secondImage as Media).alt} />}
              </div>
            ))}
          </div>
        )}
        {block.note && <p className={partners ? 'small-note centered' : 'small-note'}>{block.note}</p>}
        <CMSLink link={asLink(block.footerLink)} appearance="text" />
      </div>
    </section>
  )
}
