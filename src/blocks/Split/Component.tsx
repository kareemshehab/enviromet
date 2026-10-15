import React from 'react'
import { asLinks } from '@/lib/links'
import { CMSLink, Eyebrow, Img, LinkGroup, Lines, Paragraphs, SmartLink, sectionClass } from '@/components/ui/primitives'
import { Checklist } from '@/components/ui/Checklist'
import type { BlockData } from '../types'

export function SplitBlock({ block }: { block: BlockData<'split'> }) {
  const sec = block.secondary
  const style = block.style ?? 'default'

  const main = (
    <div>
      <Eyebrow text={block.eyebrow} />
      {block.heading && (
        <h2>
          <Lines text={block.heading} />
        </h2>
      )}
      <Paragraphs text={block.body} />
      <Checklist items={block.checklist} />
      <LinkGroup links={asLinks(block.links)} />
    </div>
  )

  let second: React.ReactNode = null
  switch (sec?.kind) {
    case 'image':
      second = (
        <figure>
          <Img media={sec.image} className={sec.rounded ? 'rounded' : undefined} />
          {sec.caption && <figcaption>{sec.caption}</figcaption>}
        </figure>
      )
      break
    case 'text':
      second = (
        <div>
          <Eyebrow text={sec.eyebrow} />
          <h2>
            <Lines text={sec.heading} />
          </h2>
          <Paragraphs text={sec.body} />
        </div>
      )
      break
    case 'aside':
      second = (
        <aside className="refine-planning-proof">
          {sec.heading && (
            <h3>
              <Lines text={sec.heading} />
            </h3>
          )}
          <Checklist items={sec.items} />
          {asLinks(sec.links).map((l, i) => (
            <CMSLink key={i} link={l} appearance="text" />
          ))}
          {sec.note && <p className="small-note">{sec.note}</p>}
        </aside>
      )
      break
    case 'standards':
      second = (
        <div className="ux-standard-list">
          {(sec.standards ?? []).map((s, i) => {
            const inner = (
              <>
                <strong>{s.title}</strong>
                {s.text && <span>{s.text}</span>}
              </>
            )
            return s.url ? (
              <SmartLink key={i} href={s.url}>
                {inner}
              </SmartLink>
            ) : (
              <div key={i}>{inner}</div>
            )
          })}
          {sec.note && <p className="small-note">{sec.note}</p>}
        </div>
      )
      break
  }

  const id = block.anchorId || undefined
  const bg = block.background
  if (style === 'profileIntro')
    return (
      <section className={sectionClass('section reference-introduction', bg)} id={id}>
        <div className="wrap reference-profile-intro">
          {main}
          {second}
        </div>
      </section>
    )
  if (style === 'fieldTeam')
    return (
      <section className={sectionClass('section field-team', bg)} id={id}>
        <div className="wrap split">
          {second}
          {main}
        </div>
      </section>
    )
  return (
    <section
      className={style === 'planning' ? (bg === 'pale' ? 'pale' : undefined) : sectionClass('section', bg, style === 'quality' ? 'ux-quality' : '')}
      id={id}
    >
      <div className="wrap split">
        {main}
        {second}
      </div>
    </section>
  )
}
