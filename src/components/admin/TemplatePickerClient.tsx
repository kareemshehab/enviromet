'use client'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React, { useState } from 'react'
import type { TemplateOption } from './TemplateChooser'

/** Template cards inside an empty page; fills the page through POST /api/pages/:id/apply-template. */
export function TemplatePickerClient({ templates }: { templates: TemplateOption[] }) {
  const { id } = useDocumentInfo()
  const title = useFormFields(([fields]) => fields.title?.value as string | undefined)
  const [choice, setChoice] = useState(String(templates[0].id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const apply = async () => {
    if (!id) {
      setError('Type a title first so the page is saved, then choose a template.')
      return
    }
    setBusy(true)
    setError('')
    try {
      // Let a pending autosave finish first, so it cannot overwrite the new sections.
      await new Promise((r) => setTimeout(r, 900))
      const res = await fetch(`/api/pages/${id}/apply-template`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: choice, title: title ?? '' }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'The template could not be applied.')
      window.location.reload() // load the page again with its new sections
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be applied.')
      setBusy(false)
    }
  }

  return (
    <section className="em-newpage em-newpage--inline" aria-labelledby="em-picker-title">
      <div className="em-newpage__head">
        <h2 id="em-picker-title">Start from a template</h2>
        <p>This page has no sections yet. Pick a layout to start from, or add sections yourself below.</p>
      </div>
      <div className="em-newpage__options" role="radiogroup" aria-label="Templates">
        {templates.map((t) => {
          const value = String(t.id)
          return (
            <label key={value} className={`em-newpage__option${choice === value ? ' is-selected' : ''}`}>
              <input type="radio" name="em-template" value={value} checked={choice === value} onChange={() => setChoice(value)} />
              <strong>{t.title}</strong>
              {t.description && <span>{t.description}</span>}
              {t.sections > 0 && <small>{t.sections === 1 ? '1 section' : `${t.sections} sections`}</small>}
            </label>
          )
        })}
      </div>
      <div className="em-newpage__create">
        <button type="button" className="btn btn--style-primary btn--size-medium" onClick={apply} disabled={busy}>
          {busy ? 'Adding sections…' : 'Use this template'}
        </button>
      </div>
      {error && (
        <p className="em-newpage__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
