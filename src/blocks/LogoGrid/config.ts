import type { Block } from 'payload'
import { eyebrow, heading } from '@/fields/common'
import { link } from '@/fields/link'
import { note, RowLabel } from '../fields'

export const LogoGrid: Block = {
  slug: 'logoGrid',
  labels: { singular: 'Logo grid', plural: 'Logo grids' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'customers',
      options: [
        { label: 'Customers', value: 'customers' },
        { label: 'Technology partners', value: 'partners' },
      ],
    },
    eyebrow,
    heading(),
    { name: 'intro', type: 'textarea', admin: { rows: 2 } },
    {
      name: 'logos',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'secondImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional joint logo' } },
        { name: 'url', type: 'text' },
      ],
    },
    note,
    link('footerLink', { appearances: ['text'], label: 'Link under the grid' }),
  ],
}
