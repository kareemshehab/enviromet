import type { Block } from 'payload'
import { eyebrow, heading } from '@/fields/common'
import { link } from '@/fields/link'

export const CallToAction: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action banner', plural: 'Call to action banners' },
  fields: [
    {
      name: 'useDefault',
      type: 'checkbox',
      defaultValue: true,
      label: 'Use the default banner from Site Settings',
    },
    {
      type: 'group',
      name: 'custom',
      admin: { condition: (_, s) => !s?.useDefault },
      fields: [eyebrow, heading(), { name: 'text', type: 'text' }, link('link', { appearances: ['white'] })],
    },
  ],
}
