import type { Block } from 'payload'
import { eyebrow, heading } from '@/fields/common'
import { link } from '@/fields/link'
import { note, RowLabel } from '../fields'

export const CapabilityCards: Block = {
  slug: 'capabilityCards',
  labels: { singular: 'Capability cards', plural: 'Capability cards' },
  fields: [
    eyebrow,
    heading(),
    link('headerLink', { appearances: ['text'], label: 'Header link' }),
    {
      name: 'cards',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', admin: { rows: 2 } },
        { name: 'url', label: 'Link URL', type: 'text', required: true },
        { name: 'linkLabel', type: 'text', defaultValue: 'Explore capabilities' },
      ],
    },
    note,
    {
      name: 'supportLinks',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'text' },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
