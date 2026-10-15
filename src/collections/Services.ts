import type { CollectionConfig, Field } from 'payload'
import { authenticated, authenticatedOrPublished } from '@/access'
import { body, eyebrow, heading, metaFields, slugField } from '@/fields/common'
import { link, linkArray } from '@/fields/link'
import { pageBlocks } from '@/blocks'
import { revalidateDocument, revalidateDocumentDelete } from '@/hooks/revalidate'
import { livePreviewBreakpoints, previewURL } from '@/lib/preview'

const RowLabel = '@/components/admin/LinkRowLabel#LinkRowLabel'
const g = (name: string, label: string, fields: Field[], description?: string): Field => ({
  name,
  label,
  type: 'group',
  admin: { description },
  fields,
})

/**
 * One template for every "solution" page (wind, solar, air, water, …).
 * Editors fill structured fields; the layout stays consistent across all 21 solutions.
 * Section order / visibility and the text common to all solutions live in the
 * "Solution pages (shared)" global (globals/SolutionTemplate.ts).
 */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Solution pages that share one template (wind, solar, air quality…).',
    livePreview: {
      url: ({ data }) => previewURL('services', data?.slug),
      breakpoints: livePreviewBreakpoints,
    },
    preview: (data) => previewURL('services', data?.slug as string),
  },
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    read: authenticatedOrPublished,
  },
  versions: { drafts: { autosave: { interval: 400 } }, maxPerDoc: 30 },
  hooks: { afterChange: [revalidateDocument], afterDelete: [revalidateDocumentDelete] },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { ...eyebrow, name: 'category', label: 'Category label' } as Field,
            { name: 'lede', type: 'textarea', admin: { rows: 2 } },
            { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
            {
              name: 'enquiryKey',
              type: 'text',
              admin: { description: 'Pre-selects this service on the contact form (?service=…)' },
            },
            g('coverage', 'Highlight figure', [
              { name: 'enabled', type: 'checkbox' },
              eyebrow,
              {
                type: 'row',
                fields: [
                  { name: 'value', type: 'text' },
                  { name: 'unit', type: 'text', admin: { description: 'Use ^2 for superscript, e.g. km^2' } },
                ],
              },
              { name: 'text', type: 'text' },
            ]),
          ],
        },
        {
          label: 'Card',
          description: 'How this service appears in card grids (services hub, expertise pages).',
          fields: [
            { name: 'summary', type: 'textarea', admin: { rows: 2 } },
            {
              type: 'row',
              fields: [
                { name: 'cardImage', type: 'upload', relationTo: 'media', admin: { width: '50%', description: 'Defaults to the hero image' } },
                { name: 'cardImageAlt', type: 'text', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Solution',
          fields: [
            { ...eyebrow, admin: { description: 'Leave empty to use the shared text (Site → Solution pages (shared)).' } } as Field,
            heading('solutionHeading'),
            { name: 'solutionIntro', type: 'textarea', admin: { rows: 2 } },
            {
              name: 'scopeItems',
              type: 'array',
              admin: { components: { RowLabel } },
              fields: [{ name: 'title', type: 'text', required: true }],
            },
            { name: 'standardsNote', label: 'Campaign context / standards', type: 'textarea', admin: { rows: 3 } },
            { name: 'deliverTitle', type: 'text', admin: { description: 'Leave empty to use the shared text (Site → Solution pages (shared)).' } },
            { name: 'deliverText', type: 'textarea', admin: { rows: 3, description: 'Leave empty to use the shared text (Site → Solution pages (shared)).' } },
            g('procurement', 'Procurement table', [
              eyebrow,
              heading(),
              { name: 'caption', type: 'text' },
              {
                name: 'rows',
                type: 'array',
                admin: { components: { RowLabel } },
                fields: [
                  { name: 'label', type: 'text', required: true },
                  { name: 'value', type: 'textarea', required: true, admin: { rows: 2 } },
                ],
              },
              link('link', { appearances: ['text'] }),
            ]),
            {
              type: 'row',
              fields: [
                { ...link('previousLink', { appearances: ['plain'], label: 'Previous solution' }), admin: { width: '50%' } },
                { ...link('nextLink', { appearances: ['plain'], label: 'Next solution' }), admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Sidebar',
          fields: [
            linkArray('relatedSolutions', { appearances: ['plain'] }),
            g(
              'enquiryBox',
              'Enquiry box',
              [
              { name: 'heading', type: 'text' },
              { name: 'text', type: 'text' },
              { name: 'buttonLabel', type: 'text' },
              { name: 'evidenceTitle', type: 'text' },
                linkArray('evidenceLinks', { appearances: ['plain'] }),
              ],
              'Empty fields use the shared enquiry box (Site → Solution pages (shared)).',
            ),
          ],
        },
        {
          label: 'Evidence & details',
          fields: [
            g('evidence', 'Related projects', [
              eyebrow,
              heading(),
              { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true },
            ]),
            g('brief', 'Requirements brief', [
              eyebrow,
              heading(),
              body(),
              { name: 'audience', label: 'Who this supports', type: 'text' },
              { name: 'note', type: 'text' },
              {
                name: 'faqs',
                type: 'array',
                admin: { components: { RowLabel } },
                fields: [
                  { name: 'question', type: 'text', required: true },
                  { name: 'answer', type: 'textarea', required: true },
                ],
              },
              link('guideLink', { appearances: ['text'], label: 'Planning guide link' }),
            ]),
            {
              name: 'showBusinessCase',
              label: 'Show the "Build a clearer business case" section',
              type: 'checkbox',
              admin: { description: 'The section itself is shared: Site → Solution pages (shared) → Shared text.' },
            },
            g('technicalBasis', 'Technical basis', [eyebrow, heading(), body(), link('link', { appearances: ['text'] })]),
            {
              name: 'extraSections',
              label: 'Extra sections (shown before the closing banner)',
              type: 'blocks',
              blocks: pageBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Custom layout',
          description:
            'Optional. When this language has its own layout (e.g. the Arabic page), it replaces the template above.',
          fields: [
            {
              name: 'customLayout',
              type: 'blocks',
              localized: true,
              blocks: pageBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        { label: 'SEO', fields: [metaFields] },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Order in the services list and card grids' },
    },
    slugField(),
  ],
}
