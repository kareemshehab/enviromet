import type { Block } from 'payload'
import { eyebrow } from '@/fields/common'
import { link } from '@/fields/link'
import { RowLabel } from '../fields'

export const HeroSlider: Block = {
  slug: 'heroSlider',
  labels: { singular: 'Hero slider', plural: 'Hero sliders' },
  fields: [
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      admin: { components: { RowLabel } },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { type: 'row', fields: [eyebrow, { name: 'mediaNote', type: 'text', admin: { description: 'Caption shown bottom-right' } }] },
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Headline line 1', type: 'text', required: true },
            { name: 'highlight', label: 'Headline line 2 (green)', type: 'text' },
          ],
        },
        { name: 'description', type: 'textarea', admin: { rows: 2 } },
        link('cta', { appearances: ['button'], label: 'Button' }),
        {
          name: 'imageFit',
          type: 'select',
          defaultValue: 'cover',
          options: [
            { label: 'Full-bleed photo', value: 'cover' },
            { label: 'Equipment composite (dual logger layout)', value: 'dual' },
          ],
        },
      ],
    },
    link('secondaryLink', { appearances: ['plain'], label: 'Secondary link (all slides)' }),
  ],
}
