import type { Block } from 'payload'
import { eyebrow, heading } from '@/fields/common'
import { link, linkArray } from '@/fields/link'
import { RowLabel } from '../fields'

export const ContactSection: Block = {
  slug: 'contactSection',
  labels: { singular: 'Contact & enquiry form', plural: 'Contact & enquiry forms' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Left column',
          fields: [
            { name: 'evidenceTitle', type: 'text' },
            linkArray('evidenceLinks', { appearances: ['plain'] }),
            eyebrow,
            heading(),
            { name: 'intro', type: 'textarea', admin: { rows: 2 } },
            { name: 'briefTitle', type: 'text' },
            { name: 'briefText', type: 'text' },
            { name: 'showOffices', type: 'checkbox', defaultValue: true, admin: { description: 'Offices come from Site Settings' } },
            { name: 'processHeading', type: 'text' },
            {
              name: 'processSteps',
              type: 'array',
              admin: { components: { RowLabel } },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            link('processLink', { appearances: ['text'] }),
          ],
        },
        {
          label: 'Form',
          fields: [
            { name: 'formHeading', type: 'text' },
            { name: 'formHelp', type: 'textarea', admin: { rows: 2 } },
            {
              name: 'serviceOptions',
              type: 'array',
              admin: { components: { RowLabel } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'key', type: 'text', admin: { description: 'Matches ?service= in links' } },
                  ],
                },
              ],
            },
            {
              name: 'stageOptions',
              type: 'array',
              admin: { components: { RowLabel } },
              fields: [{ name: 'label', type: 'text', required: true }],
            },
            { name: 'formNote', type: 'textarea', admin: { rows: 2 } },
          ],
        },
      ],
    },
  ],
}
