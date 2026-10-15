import type { Block } from 'payload'
import { eyebrow, heading } from '@/fields/common'

export const PageIntro: Block = {
  slug: 'pageIntro',
  labels: { singular: 'Page intro', plural: 'Page intros' },
  fields: [eyebrow, heading('heading', true), { name: 'lede', type: 'textarea', admin: { rows: 2 } }],
}
