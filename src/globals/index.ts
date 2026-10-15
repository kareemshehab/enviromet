import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access'
import { eyebrow, heading } from '@/fields/common'
import { link, linkArray } from '@/fields/link'
import { revalidateEverything } from '@/hooks/revalidate'

const RowLabel = '@/components/admin/LinkRowLabel#LinkRowLabel'
const access = { read: () => true, update: authenticated }

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header & navigation',
  admin: { group: 'Site' },
  access,
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      name: 'navItems',
      label: 'Main navigation',
      type: 'array',
      localized: true,
      admin: { components: { RowLabel } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'kind',
              type: 'radio',
              defaultValue: 'menu',
              options: [
                { label: 'Dropdown menu', value: 'menu' },
                { label: 'Single link', value: 'link' },
              ],
            },
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.kind === 'link' },
          fields: [
            { name: 'url', type: 'text', admin: { width: '50%' } },
            { name: 'className', label: 'CSS class', type: 'text', admin: { width: '25%' } },
            {
              name: 'lang',
              type: 'select',
              options: ['en', 'ar'],
              admin: { width: '25%', description: 'Language of the link text, if different' },
            },
          ],
        },
        {
          name: 'columns',
          type: 'array',
          admin: { condition: (_, s) => s?.kind === 'menu', components: { RowLabel } },
          fields: [{ name: 'heading', type: 'text', required: true }, linkArray('links', { appearances: ['plain'] })],
        },
      ],
    },
    link('cta', { appearances: ['button'], label: 'Highlighted button', localized: true }),
    link('languageLink', { appearances: ['plain'], label: 'Language switch', localized: true }),
    { name: 'showSearch', type: 'checkbox', defaultValue: true, localized: true },
  ],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Site' },
  access,
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    { name: 'tagline', type: 'textarea', localized: true, admin: { rows: 2 } },
    { name: 'linkedinLabel', type: 'text', localized: true },
    {
      name: 'columns',
      type: 'array',
      localized: true,
      maxRows: 4,
      admin: { components: { RowLabel } },
      fields: [{ name: 'heading', type: 'text', required: true }, linkArray('links', { appearances: ['plain'] })],
    },
    {
      name: 'contactColumn',
      type: 'group',
      localized: true,
      admin: { description: 'Optional column with the site email (leave the heading empty to hide)' },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'locations', type: 'textarea', admin: { rows: 2 } },
        link('link', { appearances: ['plain'] }),
      ],
    },
    linkArray('bottomLinks', { appearances: ['plain'], localized: true }),
    { name: 'copyrightSuffix', type: 'text', localized: true, defaultValue: 'All rights reserved.' },
    { name: 'backToTopLabel', type: 'text', localized: true, defaultValue: 'Back to top ↑' },
  ],
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Site' },
  access,
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          fields: [
            { name: 'siteName', type: 'text', defaultValue: 'EnviroMET', required: true },
            { name: 'logo', type: 'upload', relationTo: 'media', required: true },
            { name: 'utilityText', label: 'Top bar text', type: 'text', localized: true },
            { name: 'skipLinkText', type: 'text', localized: true, defaultValue: 'Skip to content' },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', required: true },
                { name: 'phone', type: 'text', admin: { description: 'Display format' } },
              ],
            },
            { name: 'linkedinUrl', type: 'text' },
            {
              name: 'offices',
              type: 'array',
              localized: true,
              admin: { components: { RowLabel } },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'address', type: 'textarea', required: true, admin: { rows: 3 } },
              ],
            },
          ],
        },
        {
          label: 'Default CTA banner',
          fields: [
            {
              name: 'defaultCta',
              type: 'group',
              localized: true,
              fields: [eyebrow, heading(), { name: 'text', type: 'text' }, link('link', { appearances: ['white'] })],
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'titleSuffix', type: 'text', defaultValue: ' | EnviroMET', localized: true },
            { name: 'defaultDescription', type: 'textarea', localized: true },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
