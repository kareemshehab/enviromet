'use client'
import { useEffect } from 'react'

const sources: Record<string, string> = {
  calculator: '/cro-621f08a8ed.js',
  b2b: '/b2b-ac92110ef3.js',
  filters: '/filters-5d2a91c4.js',
}

/**
 * Runs the original site's interactive scripts (cost calculator, print button,
 * guide search) on pages that need them. A fresh <script> is added on every visit
 * so the behaviour also works after client-side navigation.
 */
export function LegacyScripts({ scripts }: { scripts: string[] }) {
  useEffect(() => {
    const tags = scripts
      .filter((s) => sources[s])
      .map((s) => {
        const el = document.createElement('script')
        el.src = `${sources[s]}?v=${Date.now()}`
        el.async = false
        document.body.appendChild(el)
        return el
      })
    return () => tags.forEach((t) => t.remove())
  }, [scripts])
  return null
}
