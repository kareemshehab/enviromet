import type { Block } from 'payload'
import { eyebrow, heading, sectionSettings } from '@/fields/common'
import { linkArray } from '@/fields/link'
import { RowLabel } from '../fields'

export const Process: Block = {
  slug: 'process',
  labels: { singular: 'Process steps', plural: 'Process steps' },
  fields: [
    eyebrow,
    heading(),
    { name: 'intro', type: 'textarea', admin: { rows: 2 } },
    {
      name: 'steps',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', admin: { rows: 2 } },
      ],
    },
    linkArray('links', { label: 'Links under the steps' }),
    { name: 'footnote', type: 'textarea', admin: { rows: 2 } },
    linkArray('footLinks', { appearances: ['text'], label: 'Links under the footnote' }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional video or image shown beside the steps' },
    },
    { name: 'mediaPoster', type: 'upload', relationTo: 'media', admin: { description: 'Poster image for a video' } },
    { name: 'mediaCaption', type: 'text' },
    sectionSettings,
  ],
}
