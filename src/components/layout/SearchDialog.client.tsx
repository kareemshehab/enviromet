'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { legacyToRoute } from '@/lib/routes'

type SearchEntry = { title: string; category: string; text: string; path: string }
declare global {
  interface Window {
    ENVIROMET_SEARCH?: SearchEntry[]
  }
}

/** Site search: loads /search-data.js once (the original site's index) and filters it as you type. */
let searchPromise: Promise<void> | null = null
const loadSearch = () => {
  if (window.ENVIROMET_SEARCH) return Promise.resolve()
  if (!searchPromise)
    searchPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = '/search-data.js'
      s.onload = () => resolve()
      s.onerror = () => {
        searchPromise = null
        s.remove()
        reject(new Error('Search unavailable'))
      }
      document.head.append(s)
    })
  return searchPromise
}

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    ref.current?.showModal()
    loadSearch()
      .then(() => setState('ready'))
      .catch(() => setState('error'))
  }, [])

  const close = useCallback(() => ref.current?.close(), [])
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const all = (typeof window !== 'undefined' && window.ENVIROMET_SEARCH) || []
  const popular = ['All solutions', 'Systems overview', 'All applications', 'Contact & project enquiry']
  const results = words.length
    ? all.filter((x) => words.every((w) => `${x.title} ${x.category} ${x.text}`.toLowerCase().includes(w)))
    : all.filter((x) => popular.includes(x.title))

  return (
    <dialog
      ref={ref}
      className="search-dialog"
      aria-labelledby="search-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
    >
      <button className="dialog-close" aria-label="Close search" onClick={close}>
        Close ×
      </button>
      <h2 id="search-title">Explore EnviroMET</h2>
      <label htmlFor="site-query">Search solutions, systems and applications</label>
      <input
        id="site-query"
        type="search"
        autoFocus
        placeholder="Try LiDAR, maintenance or environmental"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="search-status" role="status">
        {state === 'loading'
          ? 'Loading page search…'
          : state === 'error'
            ? 'Search is temporarily unavailable. Browse Solutions or the Website Map.'
            : words.length
              ? `${results.length} matching pages`
              : 'Browse popular pages or enter a search term.'}
      </p>
      <div className="search-results">
        {state === 'ready' &&
          results.map((x) => (
            <a key={x.path + x.title} href={legacyToRoute(x.path)}>
              <strong>{x.title}</strong>
              <span>{x.category}</span>
            </a>
          ))}
      </div>
    </dialog>
  )
}
