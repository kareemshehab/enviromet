import type { Block, Field } from 'payload'

/** Shown in the admin as an eye button on each section header, and as a checkbox inside the section. */
export const hiddenField: Field = {
  name: 'hidden',
  type: 'checkbox',
  defaultValue: false,
  label: 'Hide this section on the website',
  admin: {
    description: 'The section stays saved here and can be shown again at any time.',
  },
}

const SectionLabel = '@/components/admin/SectionLabel#SectionLabel'

/**
 * Adds the section controls to a top-level page block:
 *  - a "hidden" switch (show / hide without deleting),
 *  - a header label with the section's own title and an eye button.
 * Reordering is Payload's built-in drag handle and "Move up / Move down" row actions.
 */
export const withSectionControls = (block: Block): Block => ({
  ...block,
  fields: [hiddenField, ...block.fields],
  admin: {
    ...block.admin,
    components: {
      ...block.admin?.components,
      Label: {
        path: SectionLabel,
        clientProps: { blockLabel: typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug },
      },
    },
  },
})
