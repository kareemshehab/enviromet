import React from 'react'
import { asLinks, asMedia, mediaUrl } from '@/lib/links'
import { CMSLink, Eyebrow, Img, LinkGroup, Lines, Paragraphs, sectionClass } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function ProcessBlock({ block }: { block: BlockData<'process'> }) {
  const media = asMedia(block.media)
  const steps = (
    // Number comes from the CSS counter (ux.css), so only title + text are rendered.
    <ol className="ux-process">
      {(block.steps ?? []).map((s, i) => (
        <li key={i}>
          <strong>{s.title}</strong>
          <span>{s.text}</span>
        </li>
      ))}
    </ol>
  )
  const copy = (
    <>
      <Eyebrow text={block.eyebrow} />
      <h2>
        <Lines text={block.heading} />
      </h2>
      {block.intro && <p>{block.intro}</p>}
      {steps}
      <LinkGroup links={asLinks(block.links)} />
      {(block.footnote || !!block.footLinks?.length) && (
        <div>
          <Paragraphs text={block.footnote} />
          {asLinks(block.footLinks).map((l, i) => (
            <CMSLink key={i} link={l} appearance="text" />
          ))}
        </div>
      )}
    </>
  )

  if (!media)
    return (
      <section className={sectionClass('section', block.background)} id={block.anchorId || undefined}>
        <div className="wrap">{copy}</div>
      </section>
    )

  const isVideo = media.mimeType?.startsWith('video/')
  return (
    <section className={sectionClass('section ux-delivery', block.background)} id={block.anchorId || undefined}>
      <div className="wrap split">
        <div>{copy}</div>
        <figure>
          {isVideo ? (
            <video controls playsInline preload="none" poster={mediaUrl(block.mediaPoster)}>
              <source src={media.url ?? ''} type={media.mimeType ?? 'video/mp4'} />
            </video>
          ) : (
            <Img media={media} />
          )}
          {block.mediaCaption && <figcaption>{block.mediaCaption}</figcaption>}
        </figure>
      </div>
    </section>
  )
}
