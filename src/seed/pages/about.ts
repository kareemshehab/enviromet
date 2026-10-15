import { L, type MediaMap } from '../helpers'
import { processSteps } from './home'

export const aboutLayout = (m: MediaMap) => [
  {
    blockType: 'pageIntro',
    eyebrow: 'About EnviroMET',
    heading: 'Environmental intelligence.\nPractical engineering.',
    lede: 'We connect site observations with the technical understanding needed to move a project forward.',
  },
  {
    blockType: 'split',
    style: 'default',
    eyebrow: 'Who we are',
    heading: 'Close to the field.\nFocused on the decision.',
    body:
      'EnviroMET supports environmental and meteorological measurement, wind and solar resource assessment, and engineering advisory. Our experience since 2014 includes a strong focus on Saudi Arabia and the wider region.\n\n' +
      'We work with developers, asset owners, investors, consultants, utilities and public-sector organisations. Each assignment is shaped around the project stage, the site and the information required.',
    links: [L('Discuss your campaign ↗', 'contact.html', 'button')],
    secondary: { kind: 'image', image: m.mast, caption: 'Measurement infrastructure in the field', rounded: true },
  },
  {
    blockType: 'split',
    style: 'fieldTeam',
    anchorId: 'field-team',
    eyebrow: 'PEOPLE BEHIND DELIVERY',
    heading: 'Field execution.\nEngineering coordination.',
    body: 'EnviroMET connects instrumentation, field installation, campaign operations and technical review around one agreed project scope.',
    checklist: [
      { lead: 'Field delivery:', text: 'equipment preparation, installation and commissioning records.' },
      { lead: 'Measurement operations:', text: 'monitoring, inspections, instrument care and configuration history.' },
      { lead: 'Technical coordination:', text: 'specifications, data-quality review and assessment interfaces.' },
    ],
    links: [L('Discuss your campaign ↗', 'contact.html', 'text')],
    secondary: { kind: 'image', image: m.mast, caption: 'Field measurement infrastructure.' },
  },
  {
    blockType: 'split',
    style: 'default',
    background: 'pale',
    eyebrow: 'OUR VISION',
    heading: 'Environmental intelligence\nfor sustainable development.',
    body: 'To be a leading provider of meteorology and environmental solutions across the MENA region, supporting sustainable development through reliable environmental intelligence.',
    secondary: {
      kind: 'text',
      eyebrow: 'OUR MISSION',
      heading: 'High-quality measurement.\nUseful longitudinal data.',
      body: 'Deliver hydro-meteorological solutions that equip stakeholders with precise observations and advanced monitoring methodologies.',
    },
  },
  {
    blockType: 'cardGrid',
    variant: 'lifecycle',
    eyebrow: 'THE PROJECT LIFECYCLE',
    heading: 'From feasibility\nto operation.',
    items: [
      { title: 'Feasibility', text: 'Resource assessment, site screening, permitting, commercial review and technology assessment.' },
      { title: 'Design & procurement', text: 'Technical assessments, specifications, preliminary design, tender evaluation and contracts.' },
      { title: 'Construction', text: 'Design and installation oversight, HSE focus, quality review and progress reporting.' },
      { title: 'Commissioning', text: 'Inspections, performance tests, documentation, training and acceptance review.' },
      { title: 'Operation', text: 'O&M planning, troubleshooting, performance monitoring and asset strategy support.' },
    ],
  },
  {
    blockType: 'cardGrid',
    variant: 'pillars',
    background: 'pale',
    eyebrow: 'How we work',
    heading: 'Clear objectives. Careful delivery.',
    items: [
      { title: 'Technical care', text: 'Attention to instrumentation, installation records and the assumptions behind an assessment.' },
      { title: 'Collaboration', text: 'A scope built around the needs of the project team and stakeholders.' },
      { title: 'Integrity', text: 'Documented findings, transparent limitations and responsible environmental practice.' },
    ],
  },
  {
    blockType: 'cardGrid',
    variant: 'certificates',
    eyebrow: 'Management systems',
    heading: 'Quality across the organisation.',
    items: [
      { title: 'ISO 9001:2015', text: 'Quality management' },
      { title: 'ISO 14001:2015', text: 'Environmental management' },
      { title: 'ISO 45001:2018', text: 'Occupational health & safety' },
      { title: 'ISO/IEC 27001:2022', text: 'Information security' },
      { title: 'ISO 50001:2018', text: 'Energy management' },
    ],
    note: 'Certificates name Global Environmental Technologies Trading Company. Certification concerns management systems, not a guarantee of measurement or project outcomes.',
  },
  {
    blockType: 'actions',
    anchorId: 'company-resources',
    eyebrow: 'COMPANY RESOURCES',
    heading: 'Explore the full profiles.',
    links: [
      L('Explore company capabilities ↗', 'about.html', 'button'),
      L('Explore anonymous use cases ↗', 'projects.html', 'secondary'),
    ],
  },
  {
    blockType: 'process',
    background: 'pale',
    anchorId: 'field-delivery',
    eyebrow: 'PLAN. MOBILISE. DELIVER.',
    heading: 'A coordinated route\nfrom site brief to handover.',
    intro:
      'Access, equipment, power and communications are part of the measurement plan. Responsibilities and dependencies are agreed before mobilisation.',
    steps: processSteps,
    links: [
      L('Prepare your campaign brief ↗', 'campaign-brief.html', 'button'),
      L('Explore operation & maintenance ↗', 'maintenance.html', 'text'),
    ],
  },
  {
    blockType: 'split',
    style: 'default',
    anchorId: 'safe-field-work',
    eyebrow: 'SAFETY IN THE FIELD',
    heading: 'Plan the work.\nControl the exposure.',
    body: 'Met mast activities require site-specific planning for work at height, lifting, weather, remote access and emergency arrangements. The project scope establishes responsibilities and the records needed before work begins.',
    links: [L('Explore management systems ↗', 'quality.html', 'text')],
    secondary: {
      kind: 'aside',
      heading: 'Confirm before mobilisation.',
      items: [
        { text: 'Risk assessment, method statement and site permissions' },
        { text: 'Competence and authorisation for the assigned work' },
        { text: 'PPE, access equipment and inspection requirements' },
        { text: 'Weather limits, rescue plan and emergency communications' },
      ],
      note: 'ISO 45001 concerns the occupational health and safety management system. Individual training, site permissions and task controls require their own evidence.',
    },
  },
  { blockType: 'cta', useDefault: true },
]
