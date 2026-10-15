import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access'

/** Project enquiries submitted from the website contact form. */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'service', 'createdAt', 'status'],
    group: 'Leads',
  },
  access: {
    // Anyone can submit; only logged-in staff can read or manage enquiries.
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'contacted', 'qualified', 'closed'],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: 120 },
        { name: 'email', type: 'email', required: true },
        { name: 'company', type: 'text', maxLength: 160 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'service', type: 'text', required: true, maxLength: 160 },
        { name: 'stage', type: 'text', maxLength: 160 },
        { name: 'role', type: 'text', maxLength: 60 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text', maxLength: 180 },
        { name: 'timing', type: 'text', maxLength: 40 },
        { name: 'source', type: 'text', maxLength: 80 },
      ],
    },
    { name: 'requirements', type: 'textarea', required: true, maxLength: 4000 },
    { name: 'consent', type: 'checkbox', required: true },
  ],
}
