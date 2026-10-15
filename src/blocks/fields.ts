import type { Field } from 'payload'

/** Field helpers shared by the block configs. */

export const RowLabel = '@/components/admin/LinkRowLabel#LinkRowLabel'

export const checklist = (name = 'checklist'): Field => ({
  name,
  type: 'array',
  admin: { initCollapsed: true, components: { RowLabel } },
  fields: [
    { name: 'lead', type: 'text', admin: { description: 'Optional bold lead-in, e.g. "Field delivery:"' } },
    { name: 'text', type: 'text', required: true },
  ],
})

export const note: Field = { name: 'note', type: 'textarea', admin: { rows: 2, description: 'Small print under the section' } }
