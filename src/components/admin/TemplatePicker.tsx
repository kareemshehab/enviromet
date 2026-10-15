import React from 'react'
import type { Payload } from 'payload'
import { TemplatePickerClient } from './TemplatePickerClient'
import type { TemplateOption } from './TemplateChooser'

/**
 * Page editor (ui field above the sections): "Start from a template", shown while the page has
 * no sections, e.g. right after "Create New". Server component: loads the templates.
 */
export async function TemplatePicker({ payload }: { payload: Payload }) {
  const { docs } = await payload.find({
    collection: 'page-templates',
    sort: 'sortOrder',
    depth: 0,
    limit: 20,
    pagination: false,
    overrideAccess: true,
    select: { title: true, description: true, layout: true },
  })
  const templates: TemplateOption[] = docs.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    sections: Array.isArray(t.layout) ? t.layout.length : 0,
  }))
  if (!templates.length) return null
  return <TemplatePickerClient templates={templates} />
}
