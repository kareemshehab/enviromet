import { L, type MediaMap } from '../helpers'

const scope = [
  'Campaign objectives and measurement strategy',
  'Met mast installation and sensor integration',
  'LiDAR deployment, power and communications',
  'Data quality review and resource assessment',
]
const standards =
  'Mast-mounted measurements: IEC 61400-50-1. Ground-mounted vertical-profiling remote sensing: IEC 61400-50-2. Applicability and verification requirements are established for each campaign.'
const intro =
  'Met mast, LiDAR and hybrid measurement campaigns connect site conditions with resource and yield assessment.'

export const windService = (m: MediaMap, p: Record<string, number>) => ({
  title: 'Wind resource assessment',
  slug: 'wind',
  category: 'Renewable energy',
  lede: 'Understand the wind before advancing the project.',
  heroImage: m.mast,
  enquiryKey: 'wind',
  coverage: {
    enabled: true,
    eyebrow: 'WIND RESOURCE ASSESSMENT AT SCALE',
    value: '850,000',
    unit: 'km^2',
    text: 'Wind energy resource assessment campaign coverage.',
  },
  eyebrow: 'THE SOLUTION',
  solutionHeading: 'Understand the wind before advancing the project.',
  solutionIntro: intro,
  scopeItems: scope.map((title) => ({ title })),
  standardsNote: standards,
  deliverTitle: 'Set the campaign up for review.',
  deliverText:
    'The agreed scope identifies equipment configuration, field activities, records and reporting needs. Share your site, timing and assessment objectives so the team can define the right deliverables.',
  procurement: {
    eyebrow: 'PROCUREMENT CLARITY',
    heading: 'A scope your team can compare.',
    caption: 'Agree the scope before requesting a quotation',
    rows: [
      { label: 'Objective', value: intro },
      { label: 'Delivery scope', value: scope.join('; ') },
      { label: 'Technical basis', value: standards },
      { label: 'Quotation inputs', value: 'Site and country, project stage, objective, dates, equipment preferences and available specifications.' },
      { label: 'Handover basis', value: 'Agree the applicable configuration, installation, maintenance, data and reporting records before deployment.' },
    ],
    link: L('Download and complete your project brief ↗', 'campaign-brief.html', 'text'),
  },
  previousLink: L('← Previous solution', 'lender.html'),
  nextLink: L('Next solution →', 'solar.html'),
  relatedSolutions: [
    L('Solar resource assessment ↗', 'solar.html'),
    L('Meteorological measurement ↗', 'meteorology.html'),
    L('Operation & maintenance ↗', 'maintenance.html'),
    L('Remote field power & integration ↗', 'power.html'),
  ],
  enquiryBox: {
    heading: 'Discuss your requirements.',
    text: 'Site location, project stage, measurement objectives and timing.',
    buttonLabel: 'Request a scoped quotation ↗',
    evidenceTitle: 'Evidence for your review',
    evidenceLinks: [
      L('Documented use cases ↗', 'projects.html'),
      L('Measurement standards & ISO systems ↗', 'quality.html'),
      L('Explore company capabilities ↗', 'about.html'),
    ],
  },
  evidence: {
    eyebrow: 'RELATED PROJECT EVIDENCE',
    heading: 'See the scope in practice.',
    projects: [p['kingdom-wind'], p['three-lidars']],
  },
  brief: {
    eyebrow: 'BUILT AROUND YOUR REQUIREMENTS',
    heading: 'From scope to reviewable deliverables.',
    body: 'Define the decision the resource observations must support, including observation variables, instrument siting, site conditions and assessor-specified requirements. Agree how installation records, instrument information, data checks and the intended assessment will be connected.',
    audience: 'Development and assessment teams.',
    note: 'The agreed assignment defines which activities and deliverables are included.',
    faqs: [
      {
        question: 'What should we send with an enquiry?',
        answer:
          'Share the site or facility, country, project stage, objective, available specifications and expected timing. The team can then discuss equipment, field activities or technical-review needs relevant to wind resource assessment.',
      },
    ],
    guideLink: L('Read the related planning guide ↗', 'wind-measurement-campaign-guide.html', 'text'),
  },
  technicalBasis: {
    eyebrow: 'TECHNICAL BASIS',
    heading: 'Measurement quality, from site to assessment.',
    body: 'Agree measurement heights and duration with the assessor. Record sensor identities and calibration, boom orientation and mounting geometry, terrain and obstacle conditions, acquisition settings and time reference. Preserve raw records, flag exclusions and gaps, and document uncertainty and any long-term adjustment used in the assessment. Mast-mounted instruments and ground-based vertical-profiling LiDAR follow different technical requirements.',
    link: L('Review measurement standards ↗', 'quality.html', 'text'),
  },
  meta: {
    title: 'Wind Resource Assessment & Met Masts | EnviroMET Saudi Arabia',
    description:
      'Plan wind-resource campaigns with met masts, LiDAR, field integration, maintenance and data review. Explore EnviroMET’s Saudi project references.',
  },
})
