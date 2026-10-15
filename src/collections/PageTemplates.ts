import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access'
import { pageBlocks } from '@/blocks'
import { pageTypeOptions } from '@/fields/common'

/**
 * Starting points for new pages. "Pages → New page from a template" copies a template's
 * sections (English and Arabic) into a new draft page; the template itself never appears on the site.
 */
export const PageTemplates: CollectionConfig = {
  slug: 'page-templates',
  dbName: 'templates', // short table names (SQLite/Postgres identifier limit)
  labels: { singular: 'Page template', plural: 'Page templates' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'updatedAt'],
    group: 'Content',
    description: 'Starting layouts offered when creating a new page. Editing a template does not change existing pages.',
  },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { rows: 2, description: 'Shown on the template card when creating a page.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pageType',
          type: 'select',
          defaultValue: 'general',
          admin: { width: '50%', description: 'Given to pages created from this template' },
          options: pageTypeOptions,
        },
        { name: 'sortOrder', type: 'number', defaultValue: 10, admin: { width: '50%' } },
      ],
    },
    {
      name: 'layout',
      label: 'Sections',
      type: 'blocks',
      localized: true,
      blocks: pageBlocks,
      admin: { initCollapsed: true },
    },
  ],
}
