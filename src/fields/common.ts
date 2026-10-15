import type { Field } from 'payload'
import { formatSlug } from '@/lib/slug'

/** URL slug, auto-generated from the title when left empty. */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: 'URL path segment. "home" is served at "/".',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length) return formatSlug(value)
        const source = data?.[sourceField]
        return typeof source === 'string' ? formatSlug(source) : value
      },
    ],
  },
})

export const eyebrow: Field = {
  name: 'eyebrow',
  type: 'text',
  admin: { description: 'Small uppercase label above the heading' },
}

/** Headings keep the original deliberate line breaks: press Enter for a new line. */
export const heading = (name = 'heading', required = false): Field => ({
  name,
  type: 'textarea',
  required,
  admin: { rows: 2, description: 'Each new line becomes a line break on the website.' },
})

/** Body copy: separate paragraphs with an empty line. */
export const body = (name = 'body', label?: string): Field => ({
  name,
  label,
  type: 'textarea',
  admin: { rows: 4, description: 'Separate paragraphs with an empty line.' },
})

export const sectionSettings: Field = {
  type: 'collapsible',
  label: 'Section settings',
  admin: { initCollapsed: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'background',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'White', value: 'none' },
            { label: 'Pale blue', value: 'pale' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'anchorId',
          label: 'Anchor ID',
          type: 'text',
          admin: { width: '50%', description: 'Optional, for links like /about#field-team' },
        },
      ],
    },
  ],
}

export const metaFields: Field = {
  name: 'meta',
  label: 'SEO',
  type: 'group',
  localized: true,
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Browser tab / search title. Defaults to the page title.' } },
    { name: 'description', type: 'textarea', admin: { rows: 3 } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Social sharing image' } },
  ],
}

/** Page types (Pages and Page templates): used to organise pages in the admin. */
export const pageTypeOptions = [
  { label: 'General', value: 'general' },
  { label: 'Hub / overview', value: 'hub' },
  { label: 'Expertise', value: 'expertise' },
  { label: 'Measurement system / product', value: 'product' },
  { label: 'Technical guide', value: 'guide' },
  { label: 'Use case', value: 'use-case' },
  { label: 'Audience (project teams)', value: 'audience' },
  { label: 'Tool', value: 'tool' },
]
