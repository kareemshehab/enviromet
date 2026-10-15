import type { Block } from 'payload'
import { eyebrow, heading, sectionSettings } from '@/fields/common'
import { note, RowLabel } from '../fields'

export const CardGrid: Block = {
  slug: 'cardGrid',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'lifecycle',
      options: [
        { label: 'Numbered steps (lifecycle)', value: 'lifecycle' },
        { label: 'Pillars', value: 'pillars' },
        { label: 'Certificates', value: 'certificates' },
      ],
    },
    eyebrow,
    heading(),
    {
      name: 'items',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', admin: { rows: 2 } },
      ],
    },
    note,
    sectionSettings,
  ],
}
