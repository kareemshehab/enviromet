import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '@/access'
import { pageBlocks } from '@/blocks'
import { metaFields, pageTypeOptions, slugField } from '@/fields/common'
import { revalidateDocument, revalidateDocumentDelete, revalidateMenu } from '@/hooks/revalidate'
import { livePreviewBreakpoints, previewURL } from '@/lib/preview'
import { applyTemplateToPage, createPageFromTemplate } from '@/endpoints/createPageFromTemplate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Block-based pages: add, reorder (drag or ⋯ → Move up/down) and show or hide sections (eye button).',
    components: { beforeListTable: ['@/components/admin/NewPageFromTemplate#NewPageFromTemplate'] },
    livePreview: {
      url: ({ data }) => previewURL('pages', data?.slug),
      breakpoints: livePreviewBreakpoints,
    },
    preview: (data) => previewURL('pages', data?.slug as string),
  },
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    read: authenticatedOrPublished,
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 30,
  },
  endpoints: [createPageFromTemplate, applyTemplateToPage],
  hooks: {
    afterChange: [revalidateDocument, revalidateMenu],
    afterDelete: [revalidateDocumentDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'pageType',
      type: 'select',
      defaultValue: 'general',
      admin: { position: 'sidebar', description: 'Used to organise pages in the admin list' },
      options: pageTypeOptions,
    },
    {
      name: 'menuColumn',
      label: 'Show in menu',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/admin/MenuPlacementField#MenuPlacementField' },
      },
    },
    {
      name: 'menuLabel',
      label: 'Menu label',
      type: 'text',
      localized: true,
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.menuColumn),
        description: 'Text in the menu. Leave empty to use the page title.',
      },
    },
    {
      name: 'scripts',
      label: 'Interactive behaviours',
      type: 'select',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Original site scripts this page needs' },
      options: [
        { label: 'Cost calculator', value: 'calculator' },
        { label: 'Print button & guide search', value: 'b2b' },
        { label: 'Filter buttons (projects)', value: 'filters' },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              // Template cards, shown while the page has no sections (e.g. after "Create New").
              name: 'templatePicker',
              type: 'ui',
              admin: {
                condition: (data) => !data?.layout?.length,
                components: { Field: '@/components/admin/TemplatePicker#TemplatePicker' },
              },
            },
            {
              name: 'layout',
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
    slugField(),
  ],
}
