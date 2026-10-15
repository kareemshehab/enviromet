import { L, url, type MediaMap } from '../helpers'

export const homeLayout = (m: MediaMap, p: Record<string, number>) => [
  {
    blockType: 'heroSlider',
    slides: [
      {
        image: m.energyHero,
        eyebrow: 'RESOURCE INTELLIGENCE',
        mediaNote: 'Illustrative energy landscape',
        title: 'Field measurements.',
        highlight: 'Confident decisions.',
        description:
          'Wind, solar and environmental measurement — backed by field delivery and engineering expertise across Saudi Arabia, the GCC and the Middle East.',
        cta: L('Discuss your campaign ↗', 'contact.html', 'button'),
        imageFit: 'cover',
      },
      {
        image: m.mast,
        eyebrow: 'FIELD MEASUREMENT',
        mediaNote: 'Field measurement infrastructure',
        title: 'Precision in the field.',
        highlight: 'Clarity in the data.',
        description: 'Met mast, LiDAR and meteorological campaigns built around your project.',
        cta: L('Discuss your campaign ↗', 'contact.html?service=wind', 'button'),
        imageFit: 'cover',
      },
      {
        image: m.solarStation,
        eyebrow: 'RENEWABLE ENERGY',
        mediaNote: 'Illustrative system / energy imagery',
        title: 'Understand the site.',
        highlight: 'Assess the opportunity.',
        description: 'Wind and solar observations to inform resource and energy yield assessments.',
        cta: L('Discuss your campaign ↗', 'contact.html?service=solar', 'button'),
        imageFit: 'cover',
      },
      {
        image: m.ammonitHero,
        eyebrow: 'CONNECTED SYSTEMS',
        mediaNote: 'Ammonit & Kintech integration · edited composite',
        title: 'Integrated equipment.',
        highlight: 'Continuous support.',
        description: 'Loggers, field power, communications and maintenance for the campaign lifecycle.',
        cta: L('Discuss your campaign ↗', 'contact.html?service=meteorology', 'button'),
        imageFit: 'dual',
      },
    ],
    secondaryLink: L('Explore measurement capabilities ↗', 'services.html', 'plain'),
  },
  {
    blockType: 'statsBar',
    items: [
      { value: '450+', label: 'Measurement campaigns', sublabel: 'Solar & wind resource measurement', url: url('services.html') },
      { value: '850,000', unit: 'km²', label: 'Wind resource assessment coverage', url: url('wind.html#wind-coverage') },
      { value: '5', label: 'ISO management systems', url: url('quality.html') },
    ],
  },
  {
    blockType: 'capabilityCards',
    eyebrow: 'ONE TEAM. CONNECTED CAPABILITIES.',
    heading: 'Measure with purpose.\nMove forward with clarity.',
    headerLink: L('Explore all solutions ↗', 'services.html', 'text'),
    cards: [
      { image: m.mast, title: 'Wind Resource Assessment', text: 'Met masts, remote sensing and wind resource assessment.', url: url('wind.html'), linkLabel: 'Explore capabilities' },
      { image: m.solarStation, title: 'Solar resource assessment', text: 'Irradiance observations, station delivery and resource assessment.', url: url('solar.html'), linkLabel: 'Explore capabilities' },
      { image: m.air, title: 'Environmental monitoring', text: 'Air, water and environmental observations for the project scope.', url: url('environment.html'), linkLabel: 'Explore capabilities' },
    ],
    note: 'Solar station and environmental scenes illustrate service applications.',
    supportLinks: [
      { title: 'Engineering advisory', text: 'Feasibility, due diligence and power-project support', url: url('engineering.html') },
      { title: 'Operation & maintenance', text: 'Field care, monitoring and campaign continuity', url: url('maintenance.html') },
    ],
  },
  {
    blockType: 'split',
    style: 'profileIntro',
    eyebrow: 'TOWARDS BETTER ENVIRONMENT',
    heading: 'Your partner in energy,\nmeasurement and environmental intelligence.',
    body: 'Since 2014, EnviroMET has connected field delivery with resource assessment and engineering expertise. Our work spans meteorology, renewable energy, hydrology, air quality and environmental review.',
    links: [L('Learn more ↗', 'about.html', 'text')],
    secondary: {
      kind: 'image',
      image: m.composite,
      caption: 'Illustrative composite of wind, solar and LiDAR measurement systems.',
    },
  },
  {
    blockType: 'projectsGrid',
    eyebrow: 'SELECTED PROJECT REFERENCES',
    heading: 'Measurement challenges. Documented delivery.',
    headerLink: L('Explore anonymous use cases ↗', 'projects.html', 'text'),
    source: 'selected',
    projects: [p['kingdom-wind'], p['three-lidars'], p['performance-masts']],
    note: 'Selected anonymized use cases. Individual equipment quantities relate to each illustrated scope; the 450+ figure describes combined solar and wind resource measurement campaigns.',
    background: 'pale',
  },
  {
    blockType: 'process',
    eyebrow: 'FROM SITE TO DATASET',
    heading: 'Field delivery. Coordinated from start to finish.',
    intro:
      'Instrumentation is only the starting point. We connect planning, installation, power, communications and ongoing care around your measurement objective.',
    steps: processSteps,
    links: [L('Explore measurement systems ↗', 'technologies.html', 'text')],
    footnote:
      'Field installation, operating support and technical coordination connect the measurement system with its campaign objective.',
    footLinks: [
      L('Meet the delivery approach ↗', 'about.html#field-team', 'text'),
      L('Field safety & mobilisation ↗', 'about.html#safe-field-work', 'text'),
    ],
    media: m.installationVideo,
    mediaPoster: m.mast,
    mediaCaption: 'Actual EnviroMET met mast installation footage',
  },
  {
    blockType: 'split',
    style: 'quality',
    eyebrow: 'QUALITY WITH CONTEXT',
    heading: 'Standards behind the measurement.',
    body: 'Campaign configuration, calibration records and documented field activity support a dataset that can be reviewed.',
    links: [L('Explore quality & standards ↗', 'quality.html', 'text')],
    secondary: {
      kind: 'standards',
      standards: [
        { title: 'IEC 61400-50-1', text: 'Mast-mounted wind measurements', url: url('wind.html') },
        { title: 'IEC 61400-50-2', text: 'Ground-mounted vertical-profiling remote sensing', url: url('lidar.html') },
        { title: 'IEC 61400-12-1', text: 'Wind turbine power performance', url: url('power-curve.html') },
        { title: 'Five ISO management systems', text: 'Quality, environment, safety, information security and energy', url: url('quality.html') },
      ],
      note: 'Applicable measurement requirements are agreed for each campaign. ISO management systems concern organisational practices.',
    },
  },
  {
    blockType: 'logoGrid',
    variant: 'customers',
    eyebrow: 'OUR CUSTOMERS',
    heading: 'Supporting major energy\nand measurement programmes.',
    logos: [
      { label: 'Ministry of Energy', image: m.ministryEnergy },
      { label: 'GOPA Tech / ACWA Power', image: m.acwaPower, secondImage: m.gopaTech },
      { label: 'SEPCOIII', image: m.sepcoiii },
      { label: 'Assystem / DNEC', image: m.assystem },
      { label: 'NEOM', image: m.neom },
      { label: 'National Center for Meteorology', image: m.ncm },
      { label: 'KACARE', image: m.kacare },
      { label: 'Saudi Electricity Company', image: m.sec },
    ],
    footerLink: L('Explore customer references ↗', 'customers.html', 'text'),
  },
  {
    blockType: 'logoGrid',
    variant: 'partners',
    eyebrow: 'MEASUREMENT TECHNOLOGY ECOSYSTEM',
    heading: 'Specialist technology.\nProfessional integration.',
    intro: 'We work across complementary instrument and logger platforms to configure systems around campaign requirements.',
    logos: [
      ...(
        [
          ['thies', 'Thies CLIMA'],
          ['ammonit', 'Ammonit'],
          ['profec', 'ProfEC Ventus'],
          ['kintech', 'Kintech Engineering'],
          ['ott', 'OTT HydroMet'],
          ['nesa', 'NESA'],
          ['ecotech', 'Ecotech / ACOEM Group'],
          ['zoglab', 'ZOGLAB'],
          ['everise', 'EVERISE'],
          ['ramboll', 'Ramboll'],
        ] as const
      ).map(([k, label]) => ({ label, image: m[k], url: url('partners.html') })),
      ...(
        [
          ['windtec', 'Windtec Energía'],
          ['vaisala', 'Vaisala'],
          ['zxLidars', 'ZX Lidars'],
          ['measwind', 'Measwind Renewable Services'],
        ] as const
      ).map(([k, label]) => ({ label, image: m[k] })),
    ],
    note: 'Technology providers presented in the supplied company profiles. System selection depends on the agreed scope.',
    footerLink: L('Discover our measurement systems ↗', 'technologies.html', 'text'),
  },
  {
    blockType: 'split',
    style: 'planning',
    eyebrow: 'PLAN THE NEXT STEP',
    heading: 'A clearer brief.\nA stronger comparison.',
    body: 'Compare campaign costs using your own assumptions, or prepare a technical brief to align your project team and suppliers.',
    links: [
      L('Discuss your campaign ↗', 'contact.html', 'button'),
      L('Compare campaign costs ↗', 'campaign-cost-calculator.html', 'text'),
      L('Download the campaign brief ↗', 'campaign-brief.html', 'text'),
    ],
    secondary: {
      kind: 'aside',
      heading: 'Bring the right information.',
      items: [
        { text: 'Site location and project stage' },
        { text: 'Variables, heights and campaign duration' },
        { text: 'Technical requirements and target timing' },
      ],
      links: [
        L('Guidance for procurement teams ↗', 'for-procurement.html', 'text'),
        L('Technical planning resources ↗', 'insights.html', 'text'),
      ],
    },
  },
  { blockType: 'cta', useDefault: true },
]

export const processSteps = [
  { title: 'Plan', text: 'Confirm objectives, site conditions, measurements, duration and technical requirements.' },
  { title: 'Mobilise', text: 'Coordinate equipment, transport, site access, permit responsibilities and field readiness.' },
  { title: 'Install', text: 'Integrate instruments, acquisition, power and communications; record configuration and commissioning checks.' },
  { title: 'Maintain', text: 'Monitor system status, plan inspections and preserve calibration and intervention records.' },
  { title: 'Handover', text: 'Deliver agreed data, quality flags and field records; coordinate campaign close-out where included.' },
]
