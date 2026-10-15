import type { Block } from 'payload'
import { eyebrow, heading, sectionSettings } from '@/fields/common'
import { linkArray } from '@/fields/link'

export const Actions: Block = {
  slug: 'actions',
  labels: { singular: 'Heading + buttons', plural: 'Heading + buttons' },
  fields: [eyebrow, heading(), linkArray('links'), sectionSettings],
}
