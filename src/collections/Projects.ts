import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/access'
import { metaFields, slugField } from '@/fields/common'
import { pageBlocks } from '@/blocks'
import { linkArray } from '@/fields/link'
import { revalidateEverything, revalidateEverythingDelete } from '@/hooks/revalidate'

export const projectCategories = [
  'Wind resource assessment',
  'Remote sensing',
  'Power performance',
  'Operation & maintenance',
  'Meteorological systems',
] as const

/**
 * Reference projects. Each project is both a card (Home, Projects, service pages)
 * and its own detail page at /<slug> (e.g. /project-kingdom-wind).
 * Previous / next links follow the "Sort order".
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'badge', 'sortOrder'],
    group: 'Content',
    description: 'Reference projects: shown as cards and as their own detail page.',
  },
  defaultSort: 'sortOrder',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateEverything], afterDelete: [revalidateEverythingDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Card',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  options: projectCategories.map((c) => ({ label: c, value: c })),
                  admin: { width: '50%' },
                },
                {
                  name: 'badge',
                  type: 'text',
                  required: true,
                  admin: { width: '50%', description: 'Highlight on the image, e.g. "410 met masts"' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
                {
                  name: 'imageNote',
                  type: 'select',
                  defaultValue: 'Representative imagery',
                  options: ['Representative imagery', 'Profile graphic', 'Actual project photo'],
                  admin: { width: '50%' },
                },
              ],
            },
            { name: 'challenge', type: 'textarea', required: true, admin: { rows: 2 } },
            { name: 'delivery', type: 'textarea', required: true, admin: { rows: 2 } },
            { name: 'scope', label: 'Documented scope (short)', type: 'text', required: true },
          ],
        },
        {
          label: 'Detail page',
          fields: [
            { name: 'lede', type: 'text', defaultValue: 'Anonymized use case' },
            {
              name: 'mediaCaption',
              type: 'text',
              defaultValue: 'Representative measurement imagery for this anonymized use case.',
            },
            {
              type: 'row',
              fields: [
                { name: 'summaryValue', type: 'text', admin: { width: '50%', description: 'e.g. 410 met masts' } },
                { name: 'summaryNote', type: 'text', admin: { width: '50%', description: 'e.g. 120 m each' } },
              ],
            },
            {
              name: 'scopeItems',
              label: 'Documented delivery scope',
              type: 'array',
              admin: { components: { RowLabel: '@/components/admin/LinkRowLabel#LinkRowLabel' } },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'sourceNote', type: 'textarea', admin: { rows: 2 } },
            linkArray('relatedSolutions', { appearances: ['plain'] }),
          ],
        },
        {
          label: 'Arabic page',
          description:
            'The Arabic version of this project page (/ar/<slug>), built from sections. Switch the Locale to العربية to edit it.',
          fields: [{ name: 'customLayout', label: 'Arabic layout', type: 'blocks', localized: true, blocks: pageBlocks, admin: { initCollapsed: true } }],
        },
        { label: 'SEO', fields: [metaFields] },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first' },
    },
    slugField(),
  ],
}
