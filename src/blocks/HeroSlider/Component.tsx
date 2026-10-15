import React from 'react'
import { asMedia, asLink, mediaSrcSet, mediaUrl, resolveHref } from '@/lib/links'
import { HeroSlider, type Slide } from './Slider.client'
import type { BlockData } from '../types'

export function HeroSliderBlock({ block }: { block: BlockData<'heroSlider'> }) {
  const slides: Slide[] = (block.slides ?? []).map((s) => {
    const m = asMedia(s.image)
    return {
      src: mediaUrl(s.image) ?? '',
      srcSet: mediaSrcSet(s.image),
      alt: m?.alt ?? '',
      width: m?.width ?? undefined,
      height: m?.height ?? undefined,
      eyebrow: s.eyebrow,
      title: s.title,
      highlight: s.highlight,
      description: s.description,
      ctaLabel: s.cta?.label,
      ctaHref: resolveHref(asLink(s.cta)),
      mediaNote: s.mediaNote,
      dual: s.imageFit === 'dual',
    }
  })
  const secHref = resolveHref(asLink(block.secondaryLink))
  return (
    <HeroSlider
      slides={slides}
      secondary={secHref && block.secondaryLink?.label ? { label: block.secondaryLink.label, href: secHref } : null}
    />
  )
}
