import { L, type MediaMap } from './helpers'

const col = (heading: string, links: [string, string][]) => ({
  heading,
  links: links.map(([label, href]) => L(label, href)),
})

export const headerData = () => ({
  navItems: [
    { label: 'Home', kind: 'link' as const, url: '/' },
    {
      label: 'Company',
      kind: 'menu' as const,
      columns: [
        col('EnviroMET', [
          ['About EnviroMET', 'about.html'],
          ['Our five fields of expertise', 'expertise.html'],
          ['Quality & standards', 'quality.html'],
          ['Technology partners', 'partners.html'],
          ['Careers', 'careers.html'],
        ]),
      ],
    },
    {
      label: 'Solutions',
      kind: 'menu' as const,
      columns: [
        col('Assess & advise', [
          ['All 21 solutions', 'services.html'],
          ['Wind resource assessment', 'wind.html'],
          ['Solar resource assessment', 'solar.html'],
          ['Power project consulting', 'engineering.html'],
          ['Site screening & feasibility', 'feasibility.html'],
        ]),
        col('Measurement products', [
          ['Self-supporting Towers', 'self-supporting-towers.html'],
          ['Braced Towers', 'braced-towers.html'],
          ['Solar Stations', 'solar-stations.html'],
          ['Wind LiDAR', 'wind-lidar.html'],
        ]),
        col('Environment & operations', [
          ['Environmental services', 'environment.html'],
          ['Air quality', 'air-expertise.html'],
          ['Hydrology & water', 'water-expertise.html'],
          ['Environmental & social support', 'compliance-expertise.html'],
          ['Operation & maintenance', 'maintenance.html'],
        ]),
      ],
    },
    {
      label: 'Projects',
      kind: 'menu' as const,
      columns: [
        col('Project evidence', [
          ['All use cases', 'projects.html'],
          ['Our customers', 'customers.html'],
          ['Practical use cases', 'use-cases.html'],
        ]),
      ],
    },
    {
      label: 'Resources',
      kind: 'menu' as const,
      columns: [
        col('Explore & learn', [
          ['Technical insights', 'insights.html'],
          ['Company profiles', 'about.html#company-resources'],
          ['Measurement standards', 'quality.html'],
          ['Full website map', 'sitemap.html'],
        ]),
        col('Project team resources', [
          ['Developers & owners ↗', 'for-developers.html'],
          ['Engineers & consultants ↗', 'for-engineers.html'],
          ['Procurement teams ↗', 'for-procurement.html'],
          ['Investors & lenders ↗', 'for-investors.html'],
          ['Operators & asset teams ↗', 'for-operators.html'],
          ['Campaign brief & checklist', 'campaign-brief.html'],
          ['Campaign cost & ROI planner', 'campaign-cost-calculator.html'],
        ]),
      ],
    },
  ],
  cta: L('Discuss your campaign ↗', 'contact.html', 'button'),
  languageLink: L('العربية', 'ar-index.html'),
  showSearch: true,
})

export const footerData = () => ({
  tagline: 'Reliable environmental intelligence\nfor a sustainable future.',
  linkedinLabel: 'Connect on LinkedIn ↗',
  columns: [
    col('Explore', [
      ['About EnviroMET', 'about.html'],
      ['Expertise areas', 'expertise.html'],
      ['Quality & standards', 'quality.html'],
      ['Careers', 'careers.html'],
      ['Our services', 'services.html'],
      ['Measurement technologies', 'technologies.html'],
      ['Our projects', 'projects.html'],
      ['Our customers', 'customers.html'],
      ['Strategic partners', 'partners.html'],
      ['Use cases', 'use-cases.html'],
    ]),
    col('Project support', [
      ['Wind assessment', 'wind.html'],
      ['Solar assessment', 'solar.html'],
      ['Operation & maintenance', 'maintenance.html'],
      ['Technical insights', 'insights.html'],
    ]),
  ],
  contactColumn: {
    heading: 'Let’s talk',
    locations: 'Saudi Arabia\nRiyadh · Jeddah',
    link: L('Start a project enquiry ↗', 'contact.html'),
  },
  bottomLinks: [L('Privacy & enquiries', 'privacy.html'), L('Website map', 'sitemap.html')],
})

export const settingsData = (m: MediaMap) => ({
  siteName: 'EnviroMET',
  logo: m.logo,
  utilityText: 'SAUDI ARABIA · GCC · MIDDLE EAST',
  email: 'sales@enviromet-sa.com',
  phone: '+966 11 245 8536',
  linkedinUrl: 'https://www.linkedin.com/company/enviromet-company/',
  offices: [
    {
      title: 'Riyadh headquarters',
      address: 'Al Olaya Center, Unit 11\nOlaya Street, King Fahad District\nRiyadh 12271, Saudi Arabia',
    },
    {
      title: 'Jeddah branch',
      address: 'Office 909B, Bin Hamran Towers\nPrince Muhammad Ibn Abdulaziz Branch Street\nJeddah, Saudi Arabia',
    },
  ],
  defaultCta: {
    eyebrow: 'Your next project',
    heading: 'What do you need\nto measure?',
    text: 'Share your site, project stage and objectives.',
    link: L('Discuss your campaign ↗', 'contact.html', 'white'),
  },
  titleSuffix: ' | EnviroMET',
  defaultDescription:
    'Saudi-based wind and solar resource measurement, met masts, LiDAR, environmental monitoring and engineering support.',
  ogImage: m.energyHero,
})
