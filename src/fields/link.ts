import type { Field, GroupField } from 'payload'

export type LinkAppearance = 'button' | 'secondary' | 'white' | 'text' | 'plain'

/**
 * Reusable link field.
 * - "Internal page" links to a CMS document (Pages or Services) so the URL
 *   follows the document if its slug changes.
 * - "Custom URL" covers legacy static pages (e.g. /solar.html), anchors,
 *   mailto:, tel: and external sites.
 */
export const linkFields = (options: { appearances?: LinkAppearance[]; defaultAppearance?: LinkAppearance } = {}): Field[] => {
  const appearances = options.appearances ?? ['button', 'secondary', 'white', 'text', 'plain']
  return [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Internal page', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          label: 'Open in new tab',
          type: 'checkbox',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          // Links are optional: a label is only required once a URL / page is chosen.
          validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            (siblingData?.url || siblingData?.reference) && !value ? 'Please add a label for this link' : true,
          admin: { width: '50%' },
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'services'],
          admin: { width: '50%', condition: (_, s) => s?.type === 'reference' },
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          admin: {
            width: '50%',
            condition: (_, s) => s?.type !== 'reference',
            description: 'e.g. /contact, /solar.html, #scope, mailto:…',
          },
        },
      ],
    },
    ...(appearances.length > 1
      ? [
          {
            name: 'appearance',
            type: 'select',
            defaultValue: options.defaultAppearance ?? appearances[0],
            options: appearances.map((value) => ({
              label: {
                button: 'Primary button',
                secondary: 'Secondary button',
                white: 'White button',
                text: 'Text link',
                plain: 'Plain link',
              }[value],
              value,
            })),
          } as Field,
        ]
      : []),
  ]
}

export const link = (
  name = 'link',
  options: Parameters<typeof linkFields>[0] & { label?: string; required?: boolean; localized?: boolean } = {},
): GroupField => ({
  name,
  label: options.label,
  type: 'group',
  localized: options.localized,
  admin: { hideGutter: true },
  fields: linkFields(options),
})

/** Array of links (nav columns, related links, button rows…) */
export const linkArray = (
  name: string,
  options: Parameters<typeof linkFields>[0] & { label?: string; maxRows?: number; localized?: boolean } = {},
): Field => ({
  name,
  label: options.label,
  type: 'array',
  localized: options.localized,
  maxRows: options.maxRows,
  admin: {
    initCollapsed: true,
    components: { RowLabel: '@/components/admin/LinkRowLabel#LinkRowLabel' },
  },
  fields: linkFields(options),
})
