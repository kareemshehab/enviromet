import React from 'react'
import type { Payload } from 'payload'
import { TemplateChooser, type TemplateOption } from './TemplateChooser'

/**
 * Pages list (beforeListTable): "Start a new page" panel.
 * Server component: loads the templates, the chooser handles the interaction.
 */
export async function NewPageFromTemplate({ payload }: { payload: Payload }) {
  const { docs } = await payload.find({
    collection: 'page-templates',
    sort: 'sortOrder',
    depth: 0,
    limit: 20,
    pagination: false,
    overrideAccess: true,
    select: { title: true, description: true, pageType: true, layout: true },
  })
  const templates: TemplateOption[] = docs.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    sections: Array.isArray(t.layout) ? t.layout.length : 0,
  }))
  return <TemplateChooser templates={templates} />
}
