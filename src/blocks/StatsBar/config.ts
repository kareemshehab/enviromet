import type { Block } from 'payload'
import { RowLabel } from '../fields'

export const StatsBar: Block = {
  slug: 'statsBar',
  labels: { singular: 'Stats bar', plural: 'Stats bars' },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 4,
      admin: { components: { RowLabel } },
      fields: [
        { type: 'row', fields: [{ name: 'value', type: 'text', required: true }, { name: 'unit', type: 'text' }] },
        { name: 'label', type: 'text', required: true },
        { name: 'sublabel', type: 'text' },
        { name: 'url', label: 'Link URL', type: 'text' },
      ],
    },
  ],
}
