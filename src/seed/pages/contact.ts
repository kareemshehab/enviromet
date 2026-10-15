import { L } from '../helpers'

const services: [string, string | null][] = [
  ['Wind resource assessment', 'wind'],
  ['Solar resource assessment', 'solar'],
  ['Owner’s engineering', 'engineering'],
  ['Independent engineering & due diligence', 'diligence'],
  ['Site screening & feasibility', 'feasibility'],
  ['Meteorological measurement', 'meteorology'],
  ['Operation & maintenance', 'maintenance'],
  ['Air quality monitoring', 'air'],
  ['Emissions & boundary noise', 'emissions'],
  ['Hydrology & water quality', 'water'],
  ['Environmental & social support', 'compliance'],
  ['Remote field power & integration', 'power'],
  ['Grid integration & interconnection', 'grid'],
  ['Construction & commissioning supervision', 'construction'],
  ['Plant performance testing', 'testing'],
  ['Wind turbine power-curve measurement', 'power-curve'],
  ['Asset performance monitoring', 'performance'],
  ['Measurement data & campaign reporting', 'data'],
  ['Air dispersion studies', 'dispersion'],
  ['Decommissioning & station removal', 'decommissioning'],
  ['Lender’s engineering', 'lender'],
  ['Help defining the scope', null],
]

export const contactLayout = () => [
  {
    blockType: 'pageIntro',
    eyebrow: 'Let’s connect',
    heading: 'The next step starts\nwith your requirements.',
    lede: 'Tell us where the site is, what stage the project has reached and what you need to measure or assess.',
  },
  {
    blockType: 'contactSection',
    evidenceTitle: 'Clear requirements. Reviewable evidence.',
    evidenceLinks: [
      L('Use cases ↗', 'projects.html'),
      L('Quality & standards ↗', 'quality.html'),
      L('Explore company capabilities ↗', 'about.html'),
    ],
    eyebrow: 'Project enquiries',
    heading: 'Talk to our team.',
    intro:
      'Saudi-based team, with project enquiries across the GCC, Middle East and Africa. Delivery arrangements are confirmed for each scope.',
    briefTitle: 'A useful first brief',
    briefText: 'Site and country · Project stage · Objective · Required observations · Target timing',
    showOffices: true,
    processHeading: 'What happens next?',
    processSteps: [
      { text: 'Define the project scope.' },
      { text: 'Send your enquiry — our team receives it directly.' },
      { text: 'Discuss requirements and delivery options with the team.' },
    ],
    processLink: L('Explore campaign costs ↗', 'campaign-cost-calculator.html', 'text'),
    formHeading: 'Outline your project.',
    formHelp: 'Start with the project scope. Add your contact details next to send a reviewable enquiry.',
    serviceOptions: services.map(([label, key]) => ({ label, key })),
    stageOptions: [
      'Early site screening',
      'Resource assessment',
      'Design & development',
      'Construction & commissioning',
      'Operation & maintenance',
      'Technical review',
    ].map((label) => ({ label })),
    formNote:
      'Your enquiry is sent securely to the EnviroMET team. You will also get a copy you can email from your own mail app.',
  },
]
