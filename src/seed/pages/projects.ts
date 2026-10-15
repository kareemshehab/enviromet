import { L } from '../helpers'

export const projectsLayout = () => [
  {
    blockType: 'pageIntro',
    eyebrow: 'Our projects',
    heading: 'Scale in the field.\nEvidence in the record.',
    lede: 'Explore selected projects documented in our company profiles, from nationwide met mast delivery to LiDAR and monitoring networks.',
  },
  {
    blockType: 'numbersGrid',
    eyebrow: 'ENVIROMET IN NUMBERS',
    heading: 'Measurement capability.\nAt project scale.',
    items: [
      { value: '450+', label: 'Solar and wind energy resource measurement campaigns' },
      { value: '3', label: 'ZX300 LiDARs · three-site campaign' },
      { value: '10', label: 'Met masts · 100 m each · desert wind use case' },
      { value: '2', label: 'Standalone masts · 100 m each · performance reference' },
      { value: '>95%', label: 'Routine resource data recovery reported in the profiles' },
    ],
    note: 'Selected anonymized use cases. Individual equipment quantities relate to each illustrated scope; the 450+ figure describes combined solar and wind resource measurement campaigns.',
  },
  {
    blockType: 'projectsGrid',
    eyebrow: 'REFERENCE PORTFOLIO',
    heading: 'Our projects.',
    headerLink: L('Explore our customers ↗', 'customers.html', 'text'),
    source: 'all',
    showFilters: true,
    note: 'Selected anonymized use cases. Individual equipment quantities relate to each illustrated scope; the 450+ figure describes combined solar and wind resource measurement campaigns.',
    background: 'pale',
  },
  { blockType: 'cta', useDefault: true },
]
