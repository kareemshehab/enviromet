import type { Block, Field } from 'payload'
import { body, eyebrow, heading, sectionSettings } from '@/fields/common'
import { linkArray } from '@/fields/link'
import { checklist, note, RowLabel } from '../fields'

export const Split: Block = {
  slug: 'split',
  labels: { singular: 'Two-column section', plural: 'Two-column sections' },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      admin: { description: 'Visual variant matching the original design' },
      options: [
        { label: 'Standard', value: 'default' },
        { label: 'Company introduction (large image)', value: 'profileIntro' },
        { label: 'Field team (image first)', value: 'fieldTeam' },
        { label: 'Quality & standards', value: 'quality' },
        { label: 'Planning (compact)', value: 'planning' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Main column',
      fields: [eyebrow, heading(), body(), checklist(), linkArray('links', { label: 'Buttons & links' })],
    },
    {
      name: 'secondary',
      type: 'group',
      label: 'Second column',
      fields: [
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Text', value: 'text' },
            { label: 'Highlighted aside (checklist)', value: 'aside' },
            { label: 'Standards list', value: 'standards' },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { condition: (_, s) => s?.kind === 'image' },
        },
        { name: 'caption', type: 'text', admin: { condition: (_, s) => s?.kind === 'image' } },
        { name: 'rounded', type: 'checkbox', admin: { condition: (_, s) => s?.kind === 'image' } },
        { ...eyebrow, admin: { condition: (_, s) => s?.kind === 'text' } } as Field,
        { ...heading(), admin: { rows: 2, condition: (_, s) => s?.kind === 'text' || s?.kind === 'aside' } } as Field,
        { ...body(), admin: { rows: 4, condition: (_, s) => s?.kind === 'text' } } as Field,
        { ...checklist('items'), admin: { condition: (_, s) => s?.kind === 'aside' } } as Field,
        {
          name: 'standards',
          type: 'array',
          admin: { condition: (_, s) => s?.kind === 'standards', components: { RowLabel } },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
        {
          ...linkArray('links', { appearances: ['text'] }),
          admin: { condition: (_: unknown, s: { kind?: string }) => s?.kind === 'aside' },
        } as Field,
        { ...note, admin: { rows: 2, condition: (_, s) => s?.kind === 'aside' || s?.kind === 'standards' } } as Field,
      ],
    },
    sectionSettings,
  ],
}
