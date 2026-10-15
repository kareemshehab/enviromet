'use client'
import { useRowLabel } from '@payloadcms/ui'
import React from 'react'
import { solutionParts } from '@/globals/solutionParts'

/** Row label in "Solution pages (shared) → Sections": the part name, dimmed when hidden. */
export const SolutionPartLabel = () => {
  const { data, rowNumber } = useRowLabel<{ part?: string; hidden?: boolean }>()
  const label = solutionParts.find((p) => p.value === data?.part)?.label ?? 'Choose a part'
  return (
    <span className={`em-section-label${data?.hidden ? ' is-hidden' : ''}`} style={{ pointerEvents: 'none' }}>
      <span className="em-section-label__num">{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
      <span className="em-section-label__title">{label}</span>
      {data?.hidden && <span className="em-section-label__badge">Hidden</span>}
    </span>
  )
}
