import React from 'react'
import { SmartLink } from '@/components/ui/primitives'
import type { BlockData } from '../types'

export function StatsBarBlock({ block }: { block: BlockData<'statsBar'> }) {
  return (
    <section className="refine-authority" aria-label="EnviroMET experience">
      <div className="wrap">
        {(block.items ?? []).map((item, i) => {
          const inner = (
            <>
              <strong>
                {item.value}
                {item.unit && (
                  <>
                    {' '}
                    <small>{item.unit}</small>
                  </>
                )}
              </strong>
              <span>{item.label}</span>
              {item.sublabel && <small>{item.sublabel}</small>}
            </>
          )
          return item.url ? (
            <SmartLink key={i} href={item.url}>
              {inner}
            </SmartLink>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>
    </section>
  )
}
