import type { Block } from 'payload'
import { eyebrow, heading, sectionSettings } from '@/fields/common'
import { link } from '@/fields/link'
import { note } from '../fields'

export const ProjectsGrid: Block = {
  slug: 'projectsGrid',
  labels: { singular: 'Projects grid', plural: 'Projects grids' },
  fields: [
    eyebrow,
    heading(),
    link('headerLink', { appearances: ['text'], label: 'Header link' }),
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'selected',
      options: [
        { label: 'Hand-picked projects', value: 'selected' },
        { label: 'All projects', value: 'all' },
      ],
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'selected' },
    },
    {
      name: 'showFilters',
      type: 'checkbox',
      label: 'Show category filters',
      admin: { condition: (_, s) => s?.source === 'all' },
    },
    note,
    sectionSettings,
  ],
}
