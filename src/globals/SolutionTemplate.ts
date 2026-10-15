import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access'
import { linkArray } from '@/fields/link'
import { revalidateEverything } from '@/hooks/revalidate'
import { solutionParts } from './solutionParts'

/**
 * Settings shared by all solution pages (Services):
 *  - which parts are shown, and in which order;
 *  - text that is identical on every solution (each solution can still override it).
 */
export const SolutionTemplate: GlobalConfig = {
  slug: 'solution-template',
  label: 'Solution pages (shared)',
  admin: {
    group: 'Site',
    description:
      'Applies to every solution page at once. Reorder or hide parts here; text filled in on a solution replaces the shared text below.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sections',
          description: 'Drag to reorder. Tick "Hide" to remove a part from every solution page.',
          fields: [
            {
              name: 'sections',
              type: 'array',
              admin: { components: { RowLabel: '@/components/admin/SolutionPartLabel#SolutionPartLabel' } },
              defaultValue: solutionParts.map((p) => ({ part: p.value, hidden: false })),
              validate: (rows: unknown) => {
                const parts = ((rows as { part?: string }[] | null) ?? []).map((r) => r?.part)
                const dupe = parts.find((p, i) => p && parts.indexOf(p) !== i)
                return dupe ? `"${solutionParts.find((p) => p.value === dupe)?.label}" is listed twice.` : true
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'part',
                      type: 'select',
                      required: true,
                      options: solutionParts.map((p) => ({ label: p.label, value: p.value })),
                      admin: { width: '70%' },
                    },
                    { name: 'hidden', label: 'Hide', type: 'checkbox', admin: { width: '30%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Shared text',
          description: 'Used by every solution whose own field is empty.',
          fields: [
            { name: 'eyebrow', label: 'Solution label', type: 'text', admin: { description: 'e.g. THE SOLUTION' } },
            { name: 'deliverTitle', type: 'text' },
            { name: 'deliverText', type: 'textarea', admin: { rows: 3 } },
            {
              name: 'enquiryBox',
              label: 'Enquiry box (sidebar)',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'text', type: 'text' },
                { name: 'buttonLabel', type: 'text' },
                { name: 'evidenceTitle', type: 'text' },
                linkArray('evidenceLinks', { appearances: ['plain'] }),
              ],
            },
            {
              name: 'businessCase',
              label: 'Business case strip',
              type: 'relationship',
              relationTo: 'shared-sections',
              admin: { description: 'Shown on solutions that tick "Show the business case section".' },
            },
          ],
        },
      ],
    },
  ],
}
