import React from 'react'
import { getGlobals } from '@/lib/data'
import { asLink } from '@/lib/links'
import { CMSLink, Eyebrow, Lines } from '@/components/ui/primitives'

/** Closing banner: the block's own text, or the default banner from Site Settings. */
export async function CtaBanner({
  data,
}: {
  data?: { eyebrow?: string | null; heading?: string | null; text?: string | null; link?: unknown } | null
}) {
  let cta = data
  if (!cta) cta = (await getGlobals()).settings.defaultCta
  if (!cta) return null
  return (
    <section className="cta">
      <div className="wrap cta-inner">
        <div>
          <Eyebrow text={cta.eyebrow} />
          <h2>
            <Lines text={cta.heading} />
          </h2>
          {cta.text && <p>{cta.text}</p>}
        </div>
        <CMSLink link={asLink(cta.link)} appearance="white" />
      </div>
    </section>
  )
}
