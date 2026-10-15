import type { Block, Field } from 'payload'

/**
 * Generic "Section" builder.
 *
 *   Section (section.section.pale …)
 *     └─ wrap (div.wrap / .wrap.split / .wrap.narrow …)
 *          └─ items: Heading · Text · Link · List · Image · Video · Table · FAQ · Cards · HTML
 *                    Group (div / article / aside / figure …) → items → Group → items → Group → items
 *
 * Every item maps 1:1 to an element of the original site, so pages keep their exact
 * markup (and therefore their exact design) while all text, links and images are
 * editable in the CMS.
 *
 * Text fields accept simple inline HTML (links, <strong>, <sup>…); press Enter for a line break.
 */

const RowLabel = '@/components/admin/LinkRowLabel#LinkRowLabel'

const advanced = (fields: Field[]): Field => ({
  type: 'collapsible',
  label: 'Advanced (CSS class, id, attributes)',
  admin: { initCollapsed: true },
  fields,
})

const className = (name = 'className', description?: string): Field => ({
  name,
  label: name === 'className' ? 'CSS class' : undefined,
  type: 'text',
  admin: { description },
})
const elementId: Field = { name: 'elementId', label: 'Element id (anchor)', type: 'text' }
const attrs: Field = {
  name: 'attrs',
  label: 'Extra HTML attributes',
  type: 'json',
  admin: { description: 'e.g. {"data-print": "", "role": "status"}' },
}
const html = (name: string, label?: string, required = false): Field => ({
  name,
  label,
  type: 'textarea',
  required,
  admin: { rows: 2, description: 'Inline HTML allowed (links, <strong>). Enter = line break.' },
})

/* ---------------- Leaf items ---------------- */

const HeadingItem: Block = {
  slug: 'itemHeading',
  labels: { singular: 'Heading', plural: 'Headings' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'level',
          type: 'select',
          defaultValue: 'h2',
          options: ['h1', 'h2', 'h3', 'h4'],
          admin: { width: '20%' },
        },
        { ...html('text', 'Heading', true), admin: { width: '80%', rows: 2 } } as Field,
      ],
    },
    advanced([className(), elementId]),
  ],
}

const TextItem: Block = {
  slug: 'itemText',
  labels: { singular: 'Text', plural: 'Texts' },
  fields: [
    html('text', 'Text'),
    {
      type: 'row',
      fields: [
        {
          name: 'tag',
          type: 'select',
          defaultValue: 'p',
          options: ['p', 'span', 'strong', 'small', 'b', 'em', 'div', 'label'],
          admin: { width: '30%' },
        },
        {
          name: 'style',
          type: 'select',
          admin: { width: '70%', description: 'Common styles' },
          options: [
            { label: 'Eyebrow (small caps label)', value: 'eyebrow' },
            { label: 'Lede (intro)', value: 'lede' },
            { label: 'Small note', value: 'small-note' },
            { label: 'Large copy', value: 'large-copy' },
          ],
        },
      ],
    },
    advanced([className('className', 'Overrides the style above when set'), elementId, attrs]),
  ],
}

const LinkItem: Block = {
  slug: 'itemLink',
  labels: { singular: 'Link / button', plural: 'Links / buttons' },
  fields: [
    {
      type: 'row',
      fields: [
        { ...html('label', 'Label', true), admin: { width: '50%', rows: 1 } } as Field,
        { name: 'url', label: 'URL', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'style',
          type: 'select',
          admin: { width: '50%' },
          options: [
            { label: 'Primary button', value: 'button' },
            { label: 'Secondary button', value: 'button secondary' },
            { label: 'White button', value: 'button white' },
            { label: 'Text link', value: 'text-link' },
          ],
        },
        { name: 'newTab', type: 'checkbox', label: 'Open in new tab', admin: { width: '50%' } },
      ],
    },
    advanced([className('className', 'Overrides the style above when set'), elementId, attrs]),
  ],
}

const ListItem: Block = {
  slug: 'itemList',
  labels: { singular: 'List', plural: 'Lists' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'ordered', type: 'checkbox', label: 'Numbered list', admin: { width: '30%' } },
        {
          name: 'style',
          type: 'select',
          admin: { width: '70%' },
          options: [
            { label: 'Check list', value: 'check-list' },
            { label: 'Steps', value: 'steps' },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [html('text', 'Item', true)],
    },
    advanced([className('className', 'Overrides the style above when set'), elementId]),
  ],
}

const ImageItem: Block = {
  slug: 'itemImage',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'row',
      fields: [
        { name: 'alt', type: 'text', admin: { width: '50%', description: 'Defaults to the media alt text' } },
        { name: 'caption', type: 'text', admin: { width: '50%', description: 'Shown under the image (figure)' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'rounded', type: 'checkbox', admin: { width: '33%' } },
        { name: 'figure', type: 'checkbox', label: 'Wrap in <figure>', admin: { width: '33%' } },
        { name: 'url', label: 'Link URL', type: 'text', admin: { width: '33%' } },
      ],
    },
    advanced([
      className('className', 'CSS class of the <img>'),
      className('figureClass', 'CSS class of the <figure>'),
      className('linkClass', 'CSS class of the wrapping <a>'),
      elementId,
    ]),
  ],
}

const VideoItem: Block = {
  slug: 'itemVideo',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    { name: 'video', type: 'upload', relationTo: 'media', required: true },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'caption', type: 'text' },
    advanced([className('figureClass', 'CSS class of the <figure>')]),
  ],
}

const TableItem: Block = {
  slug: 'itemTable',
  labels: { singular: 'Table', plural: 'Tables' },
  fields: [
    { name: 'caption', type: 'text' },
    {
      name: 'header',
      label: 'Column headings',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      admin: { components: { RowLabel } },
      fields: [
        {
          name: 'cells',
          type: 'array',
          admin: { description: 'The first cell is the row heading' },
          fields: [html('text', 'Cell')],
        },
      ],
    },
    { name: 'firstCellIsHeading', type: 'checkbox', defaultValue: true },
    advanced([className('wrapperClass', 'Wrapper <div> class, e.g. b2b-table (empty = no wrapper)')]),
  ],
}

const FaqItem: Block = {
  slug: 'itemFaq',
  labels: { singular: 'FAQ (question & answer)', plural: 'FAQs' },
  fields: [
    { name: 'question', type: 'text', required: true },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      admin: { rows: 3, description: 'Separate paragraphs with an empty line. Inline HTML allowed.' },
    },
    advanced([className('className', 'e.g. seo-faq')]),
  ],
}

const CardsItem: Block = {
  slug: 'itemCards',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  fields: [
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'services',
      options: [
        { label: 'Services from the CMS', value: 'services' },
        { label: 'Manual cards', value: 'manual' },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        condition: (_, s) => s?.source === 'services',
        description: 'Leave empty to show all services',
      },
    },
    {
      name: 'cards',
      type: 'array',
      admin: { condition: (_, s) => s?.source === 'manual', components: { RowLabel } },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'eyebrow', type: 'text', admin: { width: '50%' } },
            { name: 'category', type: 'text', admin: { width: '50%', description: 'Used by filters' } },
          ],
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'imageAlt', type: 'text' },
        { name: 'text', type: 'textarea', admin: { rows: 2 } },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'linkLabel', type: 'text', defaultValue: 'Explore the service' },
    {
      name: 'filter',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'No filter', value: 'none' },
        { label: 'Filter buttons (services)', value: 'services' },
        { label: 'Filter buttons (use cases)', value: 'cases' },
      ],
    },
    {
      name: 'filters',
      label: 'Filter categories',
      type: 'array',
      admin: { condition: (_, s) => s?.filter && s.filter !== 'none' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    advanced([
      className('gridClass', 'e.g. cards / cards service-grid / cards field-cards'),
      className('cardClass', 'e.g. service-card / service-card application-card'),
      { name: 'arrowSpan', type: 'checkbox', label: 'Render arrow as <span>' },
      { name: 'hideImageLink', type: 'checkbox', label: 'Hide image link from screen readers' },
    ]),
  ],
}

const HtmlItem: Block = {
  slug: 'itemHtml',
  labels: { singular: 'Custom HTML', plural: 'Custom HTML' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'tag', type: 'text', required: true, defaultValue: 'div', admin: { width: '30%' } },
        { ...className(), admin: { width: '70%' } } as Field,
      ],
    },
    {
      name: 'html',
      label: 'Inner HTML',
      type: 'code',
      admin: { language: 'html', description: 'Used for interactive widgets (e.g. the cost calculator form).' },
    },
    advanced([elementId, attrs]),
  ],
}

const EnquiryFormItem: Block = {
  slug: 'itemEnquiryForm',
  labels: { singular: 'Enquiry form', plural: 'Enquiry forms' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'help', type: 'textarea', admin: { rows: 2 } },
    {
      name: 'serviceOptions',
      type: 'array',
      admin: { initCollapsed: true, components: { RowLabel } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', admin: { width: '40%', description: 'Stored value (default: label)' } },
            { name: 'key', type: 'text', admin: { width: '20%', description: '?service=' } },
          ],
        },
      ],
    },
    {
      name: 'stageOptions',
      type: 'array',
      admin: { initCollapsed: true, components: { RowLabel } },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    { name: 'note', type: 'textarea', admin: { rows: 2 } },
  ],
}

const leafItems = [EnquiryFormItem, HeadingItem, TextItem, LinkItem, ListItem, ImageItem, VideoItem, TableItem, FaqItem, CardsItem, HtmlItem]

/* ---------------- Groups (nested containers) ---------------- */

const groupFields = (items: Block[]): Field[] => [
  {
    type: 'row',
    fields: [
      {
        name: 'tag',
        type: 'select',
        defaultValue: 'div',
        options: ['div', 'article', 'aside', 'section', 'figure', 'a', 'ol', 'ul', 'li', 'details'],
        admin: { width: '25%' },
      },
      { ...className('className', 'e.g. detail-box, refine-planning-proof, actions'), admin: { width: '45%' } } as Field,
      { name: 'url', label: 'URL (for links)', type: 'text', admin: { width: '30%', condition: (_, s) => s?.tag === 'a' } },
    ],
  },
  { name: 'items', type: 'blocks', blocks: items, admin: { initCollapsed: true } },
  advanced([elementId, attrs]),
]

const Group3: Block = {
  slug: 'itemGroup3',
  labels: { singular: 'Group', plural: 'Groups' },
  fields: groupFields(leafItems),
}
const Group2: Block = {
  slug: 'itemGroup2',
  labels: { singular: 'Group', plural: 'Groups' },
  fields: groupFields([...leafItems, Group3]),
}
const Group1: Block = {
  slug: 'itemGroup1',
  labels: { singular: 'Group', plural: 'Groups' },
  fields: groupFields([...leafItems, Group2]),
}

export const sectionItems: Block[] = [...leafItems, Group1]

export const SectionBlock: Block = {
  slug: 'section',
  labels: { singular: 'Section', plural: 'Sections' },
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
          admin: { width: '33%' },
        },
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'wrap',
          admin: { width: '33%' },
          options: [
            { label: 'Standard width', value: 'wrap' },
            { label: 'Narrow (reading)', value: 'wrap narrow' },
            { label: 'Two columns', value: 'wrap split' },
            { label: 'Main + sidebar', value: 'wrap solution-layout' },
            { label: 'Article + sidebar', value: 'wrap seo-article-layout' },
          ],
        },
        { name: 'anchorId', label: 'Anchor id', type: 'text', admin: { width: '33%' } },
      ],
    },
    { name: 'items', type: 'blocks', blocks: sectionItems, admin: { initCollapsed: true } },
    advanced([
      className('sectionClass', 'Full class of <section> (overrides background), e.g. "section pale cro-next"'),
      className('wrapClass', 'Full class of the inner wrapper (overrides layout)'),
      { name: 'sectionTag', type: 'text', admin: { description: 'Default: section' } },
      attrs,
    ]),
  ],
}
