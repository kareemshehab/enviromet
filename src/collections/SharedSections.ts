import { APIError, type CollectionBeforeDeleteHook, type CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/access'
import { contentBlocks } from '@/blocks'
import { revalidateEverything, revalidateEverythingDelete } from '@/hooks/revalidate'
import { findSharedSectionUsage } from '@/lib/sharedSectionUsage'

/** A section still placed on pages cannot be deleted (the pages would lose it silently). */
const preventDeleteWhileUsed: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (req.context?.disableRevalidate) return // seed wipe
  const uses = await findSharedSectionUsage(req.payload, id, req)
  if (uses.length)
    throw new APIError(
      `This section is used on ${uses.map((u) => u.label).join(', ')}. Remove it from those pages first.`,
      400,
      undefined,
      true,
    )
}

/**
 * Library of sections that appear on several pages (e.g. the "Technical questions" FAQ on
 * every equipment page). Edit once here: every page that places it updates.
 * Pages place one with the "Shared section" block and can hide or reorder it per page.
 */
export const SharedSections: CollectionConfig = {
  slug: 'shared-sections',
  dbName: 'shared', // short table names (SQLite/Postgres identifier limit)
  labels: { singular: 'Shared section', plural: 'Shared sections' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Content',
    description: 'Sections used on several pages. Edit once: every page that uses the section updates.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  versions: { maxPerDoc: 20 },
  hooks: {
    beforeDelete: [preventDeleteWhileUsed],
    afterChange: [revalidateEverything],
    afterDelete: [revalidateEverythingDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal name shown in the page editor, e.g. "Technical questions (equipment pages)".' },
    },
    {
      name: 'usage',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/SharedSectionUsage#SharedSectionUsage' } },
    },
    {
      name: 'layout',
      label: 'Content',
      type: 'blocks',
      localized: true,
      blocks: contentBlocks,
      admin: { description: 'Usually one section. English and Arabic are edited separately (Locale switch, top right).' },
    },
  ],
}
