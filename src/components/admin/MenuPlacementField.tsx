'use client'
import { SelectInput, useField } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientComponent } from 'payload'
import React, { useEffect, useState } from 'react'

type Header = {
  navItems?: { kind?: string; label?: string; columns?: { id?: string; heading?: string }[] }[]
}

/**
 * Page sidebar → "Show in menu": lists the dropdowns of the main navigation and their columns
 * (read live from Site → Header & navigation), e.g. "Solutions › Measurement products".
 * Stores the column id; the website header adds the page to that column once it is published.
 */
export const MenuPlacementField: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [options, setOptions] = useState<OptionObject[]>([])

  useEffect(() => {
    let live = true
    fetch('/api/globals/header?depth=0&locale=en', { credentials: 'include' })
      .then((r) => (r.ok ? (r.json() as Promise<Header>) : null))
      .then((header) => {
        if (!live || !header) return
        const opts: OptionObject[] = []
        for (const item of header.navItems ?? [])
          if (item.kind === 'menu')
            for (const col of item.columns ?? [])
              if (col.id) opts.push({ label: `${item.label} › ${col.heading}`, value: col.id })
        setOptions(opts)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  // A column that was deleted from the header shows as "(removed)" so it can be cleared.
  const known = !value || options.some((o) => o.value === value)
  const all = known || !options.length ? options : [...options, { label: '(menu column removed)', value }]

  return (
    <SelectInput
      path={path}
      name={field.name}
      label={field.label || 'Show in menu'}
      description="Adds this page to the website's main menu (English) once it is published. Leave empty to keep it out of the menu."
      options={all}
      value={value ?? ''}
      isClearable
      placeholder="Not in the menu"
      onChange={(option) => {
        const picked = Array.isArray(option) ? option[0] : option
        setValue((picked as OptionObject | null)?.value ?? null)
      }}
    />
  )
}
