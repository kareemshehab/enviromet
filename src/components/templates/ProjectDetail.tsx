import React from 'react'
import type { Project } from '@/payload-types'
import type { LinkData } from '@/lib/links'
import { getAllProjects } from '@/lib/data'
import { CMSLink, Img, SmartLink } from '@/components/ui/primitives'
import { CtaBanner } from '@/blocks/CallToAction/Component'

/** Detail page of a reference project (/project-…). Previous/next follow the project sort order. */
export async function ProjectDetail({ project: p }: { project: Project }) {
  const all = await getAllProjects()
  const i = all.findIndex((x) => x.id === p.id)
  const prev = all[(i - 1 + all.length) % all.length]
  const next = all[(i + 1) % all.length]

  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <p className="eyebrow">USE CASE / {p.category}</p>
          <h1>{p.title}</h1>
          {p.lede && <p className="lede">{p.lede}</p>}
        </div>
      </section>
      <section className="section">
        <div className="wrap solution-layout">
          <div>
            <figure className="project-detail-media">
              <Img media={p.image} alt={p.title} />
              {p.mediaCaption && <figcaption>{p.mediaCaption}</figcaption>}
            </figure>
            <section className="refine-case-overview">
              <h2>The measurement challenge.</h2>
              <p>{p.challenge}</p>
              <h2>The delivery approach.</h2>
              <p>{p.delivery}</p>
            </section>
            {(p.summaryValue || p.summaryNote) && (
              <div className="project-summary">
                <strong>{p.summaryValue}</strong>
                {p.summaryNote && <span>{p.summaryNote}</span>}
              </div>
            )}
            {!!p.scopeItems?.length && (
              <>
                <p className="eyebrow">DOCUMENTED SCOPE</p>
                <h2>Documented delivery scope.</h2>
                <ul className="check-list">
                  {p.scopeItems.map((s, k) => (
                    <li key={k}>{s.text}</li>
                  ))}
                </ul>
              </>
            )}
            {p.sourceNote && <p className="small-note">{p.sourceNote}</p>}
            {all.length > 1 && (
              <div className="page-neighbours">
                <SmartLink href={`/${prev.slug}`}>← Previous use case</SmartLink>
                <SmartLink href={`/${next.slug}`}>Next use case →</SmartLink>
              </div>
            )}
          </div>
          {!!p.relatedSolutions?.length && (
            <aside className="related-nav">
              <h3>Related solutions</h3>
              {(p.relatedSolutions as LinkData[]).map((l, k) => (
                <CMSLink key={k} link={l} appearance="plain" />
              ))}
            </aside>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
