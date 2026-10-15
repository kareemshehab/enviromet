import Link from 'next/link'
import React, { Fragment } from 'react'
import { appearanceClass, asMedia, mediaSrcSet, mediaUrl, resolveHref, type LinkData } from '@/lib/links'

/** Text with author-controlled line breaks (headings keep their original two-line rhythm). */
export const Lines = ({ text }: { text?: string | null }) => {
  if (!text) return null
  const lines = text.split(/\r?\n/)
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}

/** Paragraphs separated by an empty line. */
export const Paragraphs = ({ text, className }: { text?: string | null; className?: string }) => {
  if (!text) return null
  return (
    <>
      {text
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className}>
            {p}
          </p>
        ))}
    </>
  )
}

/** Renders `km^2` as km<sup>2</sup>. */
export const Unit = ({ text }: { text?: string | null }) => {
  if (!text) return null
  const [base, sup] = text.split('^')
  return (
    <>
      {base}
      {sup && <sup>{sup}</sup>}
    </>
  )
}

const isInternalRoute = (href: string) => href.startsWith('/') && !href.startsWith('//') && !/\.[a-z0-9]+($|[?#])/i.test(href)

/**
 * Smart anchor: routes rendered by Next.js use client-side navigation;
 * legacy static pages (*.html), mailto:, tel: and external links use a normal <a>.
 */
export const SmartLink = ({
  href,
  className,
  children,
  newTab,
  ...rest
}: { href: string; className?: string; children: React.ReactNode; newTab?: boolean | null } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) => {
  const target = newTab ? { target: '_blank', rel: 'noopener' } : {}
  if (isInternalRoute(href))
    return (
      <Link href={href} className={className} {...target} {...rest}>
        {children}
      </Link>
    )
  return (
    <a href={href} className={className} {...target} {...rest}>
      {children}
    </a>
  )
}

export const CMSLink = ({
  link,
  className,
  appearance,
  children,
}: {
  link?: LinkData | null
  className?: string
  appearance?: LinkData['appearance']
  children?: React.ReactNode
}) => {
  const href = resolveHref(link)
  if (!link || !href) return null
  const cls = [appearanceClass(appearance ?? link.appearance), className].filter(Boolean).join(' ') || undefined
  return (
    <SmartLink href={href} className={cls} newTab={link.newTab}>
      {children ?? link.label}
    </SmartLink>
  )
}

/** Renders a list of links; wraps in .actions when there is more than one (matches original markup). */
export const LinkGroup = ({ links, forceWrap }: { links?: LinkData[] | null; forceWrap?: boolean }) => {
  if (!links?.length) return null
  const items = links.map((l, i) => <CMSLink key={i} link={l} />)
  return links.length > 1 || forceWrap ? <div className="actions">{items}</div> : <>{items}</>
}

export const Img = ({
  media,
  alt,
  className,
  sizes = '(max-width:760px) calc(100vw - 44px), (max-width:1279px) 50vw, 620px',
  priority,
  id,
}: {
  media: unknown
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  id?: string
}) => {
  const m = asMedia(media)
  const src = mediaUrl(media)
  if (!m || !src) return null
  const srcSet = mediaSrcSet(media)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      id={id}
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt ?? m.alt ?? ''}
      width={m.width ?? undefined}
      height={m.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  )
}

export const Eyebrow = ({ text, id, className }: { text?: string | null; id?: string; className?: string }) =>
  text ? (
    <p className={['eyebrow', className].filter(Boolean).join(' ')} id={id}>
      {text}
    </p>
  ) : null

export const sectionClass = (base: string, background?: string | null, extra?: string) =>
  [base, background === 'pale' ? 'pale' : '', extra].filter(Boolean).join(' ')
