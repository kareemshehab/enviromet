'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export type TemplateOption = { id: number | string; title: string; description: string; sections: number }

/** Title + template cards; creates a draft page through POST /api/pages/from-template and opens it. */
export function TemplateChooser({ templates }: { templates: TemplateOption[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [choice, setChoice] = useState<string>(templates[0] ? String(templates[0].id) : 'blank')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Enter a title for the new page.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/pages/from-template', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, template: choice === 'blank' ? null : choice }),
      })
      const json = (await res.json()) as { id?: number; error?: string }
      if (!res.ok || !json.id) throw new Error(json.error || 'The page could not be created.')
      router.push(`/admin/collections/pages/${json.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The page could not be created.')
      setBusy(false)
    }
  }

  const options = [
    ...templates.map((t) => ({ ...t, id: String(t.id) })),
    { id: 'blank', title: 'Blank page', description: 'No sections: build the page yourself.', sections: 0 },
  ]

  return (
    <section className="em-newpage" id="new-page" aria-labelledby="em-newpage-title">
      <form onSubmit={create}>
        <div className="em-newpage__head">
          <h2 id="em-newpage-title">Start a new page</h2>
          <p>Pick a starting layout. The page is created as a draft, so nothing goes live until you publish it.</p>
        </div>
        <fieldset className="em-newpage__options">
          <legend className="em-sr-only">Starting layout</legend>
          {options.map((o) => (
            <label key={o.id} className={`em-newpage__option${choice === o.id ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="template"
                value={o.id}
                checked={choice === o.id}
                onChange={() => setChoice(o.id)}
              />
              <strong>{o.title}</strong>
              {o.description && <span>{o.description}</span>}
              {o.sections > 0 && <small>{o.sections === 1 ? '1 section' : `${o.sections} sections`}</small>}
            </label>
          ))}
        </fieldset>
        <div className="em-newpage__create">
          <label htmlFor="em-newpage-name">Page title</label>
          <input
            id="em-newpage-name"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wind LiDAR rental"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--style-primary btn--size-medium" disabled={busy}>
            {busy ? 'Creating…' : 'Create page'}
          </button>
          <Link className="em-newpage__manage" href="/admin/collections/page-templates">
            Manage templates
          </Link>
        </div>
        {error && (
          <p className="em-newpage__error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
