import type { Block } from 'payload'
import { eyebrow, heading, sectionSettings } from '@/fields/common'
import { note, RowLabel } from '../fields'

export const NumbersGrid: Block = {
  slug: 'numbersGrid',
  labels: { singular: 'Key numbers', plural: 'Key numbers' },
  fields: [
    eyebrow,
    heading(),
    {
      name: 'items',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    note,
    sectionSettings,
  ],
}
