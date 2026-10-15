'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SmartLink } from '@/components/ui/primitives'

export type Slide = {
  src: string
  srcSet?: string
  alt: string
  width?: number
  height?: number
  eyebrow?: string | null
  title: string
  highlight?: string | null
  description?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  mediaNote?: string | null
  dual?: boolean
}

/** Homepage carousel — manual by default (visitors decide when content changes), with Play/Pause. */
export function HeroSlider({ slides, secondary }: { slides: Slide[]; secondary?: { label: string; href: string } | null }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(true)
  const hovering = useRef(false)
  const total = slides.length
  const s = slides[current] ?? slides[0]

  const choose = useCallback(
    (i: number) => {
      setCurrent((i + total) % total)
      setPaused(true)
    },
    [total],
  )

  useEffect(() => {
    if (paused || total < 2) return
    const id = window.setInterval(() => {
      if (!hovering.current && !document.hidden) setCurrent((c) => (c + 1) % total)
    }, 7000)
    return () => window.clearInterval(id)
  }, [paused, total])

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => e.matches && setPaused(true)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  if (!s) return null
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section
      className={`reference-hero${s.dual ? ' dual-logger-hero' : ''}`}
      aria-roledescription="carousel"
      aria-label="EnviroMET capabilities"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocus={() => setPaused(true)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        fetchPriority="high"
        id="slide-photo"
        src={s.src}
        srcSet={s.srcSet}
        sizes={s.srcSet ? '100vw' : undefined}
        alt={s.alt}
        width={s.width}
        height={s.height}
        decoding="async"
      />
      <div className="reference-hero-shade"></div>
      <div className="wrap reference-hero-copy">
        {s.eyebrow && (
          <p className="eyebrow" id="slide-kicker">
            {s.eyebrow}
          </p>
        )}
        <h1>
          <span id="slide-line-one">{s.title}</span>
          {s.highlight && (
            <>
              <br />
              <em id="slide-line-two">{s.highlight}</em>
            </>
          )}
        </h1>
        {s.description && <p id="slide-description">{s.description}</p>}
        {s.ctaHref && s.ctaLabel && (
          <SmartLink className="button" id="slide-link" href={s.ctaHref}>
            {s.ctaLabel}
          </SmartLink>
        )}
        {secondary && (
          <SmartLink className="hero-secondary" href={secondary.href}>
            {secondary.label}
          </SmartLink>
        )}
        {total > 1 && (
          <div className="hero-controls">
            <button id="slide-prev" aria-label="Previous slide" onClick={() => choose(current - 1)}>
              ←
            </button>
            <div className="slide-dots">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  data-slide={i}
                  aria-label={`Show slide ${i + 1}: ${(slide.eyebrow || slide.title).toLowerCase()}`}
                  aria-pressed={i === current}
                  onClick={() => choose(i)}
                >
                  <span>{pad(i + 1)}</span>
                </button>
              ))}
            </div>
            <button id="slide-next" aria-label="Next slide" onClick={() => choose(current + 1)}>
              →
            </button>
            <button
              id="slide-pause"
              aria-label={paused ? 'Start automatic slide rotation' : 'Pause automatic slide rotation'}
              onClick={() => {
                // Pressing Play starts the rotation even though the pointer is over the slider
                // (as on the original site: hovering only holds it once the pointer enters again).
                hovering.current = false
                setPaused((p) => !p)
              }}
            >
              {paused ? 'Play' : 'Pause'}
            </button>
            <span className="slide-position" aria-live="off">
              {pad(current + 1)} / {pad(total)}
            </span>
          </div>
        )}
      </div>
      {s.mediaNote && (
        <span className="hero-media-note" id="slide-media-note">
          {s.mediaNote}
        </span>
      )}
    </section>
  )
}
