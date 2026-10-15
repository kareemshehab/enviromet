import type { Block } from 'payload'

/**
 * Places a section from the Shared sections library on a page.
 * The content lives once in "Shared sections"; every page that uses it updates together.
 * Each page can still hide it or move it (section controls are added in blocks/index.ts).
 */
export const SharedSection: Block = {
  slug: 'sharedSection',
  labels: { singular: 'Shared section', plural: 'Shared sections' },
  fields: [
    {
      name: 'section',
      label: 'Section from the library',
      type: 'relationship',
      relationTo: 'shared-sections',
      required: true,
      admin: {
        description: 'Edit the content in Content → Shared sections. Changes appear on every page that uses it.',
      },
    },
  ],
}
