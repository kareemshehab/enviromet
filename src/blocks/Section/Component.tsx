import React from 'react'
import type { Service } from '@/payload-types'
import { getPayloadClient } from '@/lib/data'
import { asMedia, mediaSrcSet, mediaUrl } from '@/lib/links'
import { Img, SmartLink } from '@/components/ui/primitives'
import { attrsToProps, inline } from './attrs'
import { CardsGridClient, type Card } from './CardsGrid.client'
import { EnquiryForm } from '../ContactSection/EnquiryForm.client'
import { getGlobals, getRequestLocale } from '@/lib/data'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Item = { blockType: string; id?: string | null; [k: string]: any }

const cls = (...c: (string | null | undefined | false)[]) => c.filter(Boolean).join(' ') || undefined
const hasTags = (s?: string | null) => !!s && /<[a-z]/i.test(s)

async function CardsItem({ item }: { item: Item }) {
  const locale = getRequestLocale()
  let cards: Card[] = []
  if (item.source === 'manual') {
    cards = (item.cards ?? []).map((c: any) => {
      const m = asMedia(c.image)
      return {
        title: c.title,
        eyebrow: c.eyebrow,
        category: c.category,
        text: c.text,
        url: c.url,
        image: m
          ? { src: m.url!, srcSet: mediaSrcSet(m), alt: c.imageAlt ?? m.alt, width: m.width ?? undefined, height: m.height ?? undefined }
          : null,
      }
    })
  } else {
    let services: Service[] = (item.services ?? []).filter((s: unknown) => s && typeof s === 'object')
    if (!services.length) {
      const payload = await getPayloadClient()
      services = (
        await payload.find({
          collection: 'services',
          where: { _status: { equals: 'published' } },
          sort: 'sortOrder',
          depth: 1,
          limit: 200,
          pagination: false,
        })
      ).docs
    }
    cards = services.map((s) => {
      const m = asMedia(s.cardImage) ?? asMedia(s.heroImage)
      return {
        title: s.title,
        eyebrow: s.category,
        category: s.category,
        text: s.summary ?? s.solutionIntro,
        url: `/${s.slug}`,
        image: m
          ? {
              src: m.url!,
              srcSet: mediaSrcSet(m),
              alt: s.cardImageAlt ?? `${s.title} equipment or assessment use case`,
              width: m.width ?? undefined,
              height: m.height ?? undefined,
            }
          : null,
      }
    })
  }
  return (
    <CardsGridClient
      cards={cards}
      linkLabel={item.linkLabel || (locale === 'ar' ? 'استكشف الخدمة' : 'Explore the service')}
      filter={item.filter ?? 'none'}
      filters={(item.filters ?? []).map((f: any) => f.label)}
      gridClass={item.gridClass || 'cards'}
      cardClass={item.cardClass || 'service-card'}
      arrowSpan={item.arrowSpan}
      hideImageLink={item.hideImageLink}
      locale={locale}
    />
  )
}

async function EnquiryFormItem({ item }: { item: Item }) {
  const locale = getRequestLocale()
  const { settings } = await getGlobals(locale)
  return (
    <EnquiryForm
      locale={locale}
      heading={item.heading}
      help={item.help}
      note={item.note}
      services={(item.serviceOptions ?? []).map((o: any) => ({ label: o.label, value: o.value, key: o.key }))}
      stages={(item.stageOptions ?? []).map((o: any) => ({ label: o.label }))}
      email={settings.email}
    />
  )
}

function LinkEl({ item }: { item: Item }) {
  const className = item.className || item.style || undefined
  const props: Record<string, unknown> = {
    className,
    id: item.elementId || undefined,
    ...(item.newTab ? { target: '_blank', rel: 'noopener' } : {}),
    ...attrsToProps(item.attrs),
  }
  if (hasTags(item.label) || props.download || /^(mailto:|tel:|https?:|#)/.test(item.url ?? ''))
    return <a href={item.url} {...props} dangerouslySetInnerHTML={inline(item.label)} />
  return (
    <SmartLink href={item.url} {...props}>
      {item.label}
    </SmartLink>
  )
}

export function RenderItems({ items }: { items?: Item[] | null }) {
  if (!items?.length) return null
  return (
    <>
      {items.map((item, i) => (
        <RenderItem key={item.id ?? i} item={item} />
      ))}
    </>
  )
}

export function RenderItem({ item }: { item: Item }): React.ReactNode {
  switch (item.blockType) {
    case 'itemHeading':
      return React.createElement(item.level || 'h2', {
        className: item.className || undefined,
        id: item.elementId || undefined,
        dangerouslySetInnerHTML: inline(item.text),
      })
    case 'itemText':
      return React.createElement(item.tag || 'p', {
        className: item.className || item.style || undefined,
        id: item.elementId || undefined,
        ...attrsToProps(item.attrs),
        dangerouslySetInnerHTML: inline(item.text),
      })
    case 'itemLink':
      return <LinkEl item={item} />
    case 'itemList':
      return React.createElement(
        item.ordered ? 'ol' : 'ul',
        { className: item.className || item.style || undefined, id: item.elementId || undefined },
        (item.items ?? []).map((li: any, i: number) => <li key={i} dangerouslySetInnerHTML={inline(li.text)} />),
      )
    case 'itemImage': {
      let img: React.ReactNode = (
        <Img media={item.image} alt={item.alt ?? undefined} className={cls(item.className, item.rounded && !item.className && 'rounded')} />
      )
      if (item.url)
        img = (
          <SmartLink href={item.url} className={item.linkClass || undefined}>
            {img}
          </SmartLink>
        )
      if (!item.figure && !item.caption) return img
      return (
        <figure className={item.figureClass || undefined} id={item.elementId || undefined}>
          {img}
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      )
    }
    case 'itemVideo': {
      const v = asMedia(item.video)
      return (
        <figure className={item.figureClass || undefined}>
          <video controls playsInline preload="none" poster={mediaUrl(item.poster)}>
            <source src={v?.url ?? ''} type={v?.mimeType ?? 'video/mp4'} />
          </video>
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      )
    }
    case 'itemTable': {
      const table = (
        <table>
          {item.caption && <caption>{item.caption}</caption>}
          {!!item.header?.length && (
            <thead>
              <tr>
                {item.header.map((h: any, i: number) => (
                  <th key={i} scope="col">
                    {h.text}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(item.rows ?? []).map((r: any, i: number) => (
              <tr key={i}>
                {(r.cells ?? []).map((c: any, j: number) =>
                  j === 0 && item.firstCellIsHeading !== false ? (
                    <th key={j} scope="row" dangerouslySetInnerHTML={inline(c.text)} />
                  ) : (
                    <td key={j} dangerouslySetInnerHTML={inline(c.text)} />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )
      return item.wrapperClass ? <div className={item.wrapperClass}>{table}</div> : table
    }
    case 'itemFaq':
      return (
        <details className={item.className || undefined}>
          <summary>{item.question}</summary>
          {String(item.answer ?? '')
            .split(/\r?\n\s*\r?\n/)
            .filter((p: string) => p.trim())
            .map((p: string, i: number) => (
              <p key={i} dangerouslySetInnerHTML={inline(p.trim())} />
            ))}
        </details>
      )
    case 'itemCards':
      return <CardsItem item={item} />
    case 'itemEnquiryForm':
      return <EnquiryFormItem item={item} />
    case 'itemHtml':
      return React.createElement(item.tag || 'div', {
        className: item.className || undefined,
        id: item.elementId || undefined,
        ...attrsToProps(item.attrs),
        dangerouslySetInnerHTML: { __html: item.html ?? '' },
      })
    case 'itemGroup1':
    case 'itemGroup2':
    case 'itemGroup3': {
      const props = {
        className: item.className || undefined,
        id: item.elementId || undefined,
        ...attrsToProps(item.attrs),
      }
      const children = <RenderItems items={item.items} />
      if (item.tag === 'a' && item.url)
        return (
          <SmartLink href={item.url} {...props}>
            {children}
          </SmartLink>
        )
      return React.createElement(item.tag || 'div', props, children)
    }
    default:
      return null
  }
}

export function SectionRenderer({ block }: { block: Item }) {
  const sectionClass = block.sectionClass ?? cls('section', block.background === 'pale' && 'pale')
  const wrapClass = block.wrapClass ?? block.layout ?? 'wrap'
  const content = <RenderItems items={block.items} />
  return React.createElement(
    block.sectionTag || 'section',
    { className: sectionClass || undefined, id: block.anchorId || undefined, ...attrsToProps(block.attrs) },
    wrapClass === '-' ? content : <div className={wrapClass}>{content}</div>,
  )
}
