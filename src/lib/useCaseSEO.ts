/** Descriptions reflect the six illustrative use cases, without claiming customer results. */
export const useCaseDescriptions: Record<string, { en: string; ar: string }> = {
  'use-case-environmental-campaign': {
    en: 'Explore facility monitoring with EnviroMET: define the scope, collect environmental observations and prepare reporting to guide review and next actions.',
    ar: 'تعرّف على مثال لمراقبة البيئة حول منشأة، من تحديد نطاق الرصد وجمع الملاحظات إلى إعداد التقارير لدعم تقييم الظروف البيئية والخطوات التالية.',
  },
  'use-case-remote-network': {
    en: 'Explore a remote measurement network combining solar and battery power, enclosures, communications and maintenance to support field campaign operations.',
    ar: 'استكشف مثالًا لشبكة قياس في موقع ناءٍ تجمع الطاقة الشمسية والبطاريات وصناديق الحماية والاتصالات والصيانة لتلبية احتياجات تشغيل الحملات الميدانية.',
  },
  'use-case-solar-campaign': {
    en: 'Explore a solar resource campaign with station configuration, cleaning and calibration planning, and site observations to review resource and yield assumptions.',
    ar: 'استكشف مثالًا لحملة تقييم المورد الشمسي تشمل تجهيز محطة القياس والتخطيط للتنظيف والمعايرة وجمع ملاحظات الموقع لمراجعة افتراضات المورد والإنتاج.',
  },
  'use-case-technical-review': {
    en: 'See how EnviroMET reviews project resources, engineering decisions and relevant risks, with documented findings to support the next project decision.',
    ar: 'تعرّف على مثال لمراجعة موارد المشروع وقراراته الهندسية والمخاطر المرتبطة به ضمن نطاق متفق عليه، مع توثيق النتائج لدعم اتخاذ القرار التالي.',
  },
  'use-case-water-assessment': {
    en: 'Explore water assessment near a development, with site observations, sampling and hydrological analysis to inform risk reviews and further investigation.',
    ar: 'استكشف مثالًا لتقييم ظروف المياه قرب مشروع تطوير، من تخطيط ملاحظات الموقع وأخذ العينات إلى التحليل الهيدرولوجي لدعم مراجعة المخاطر والاستقصاء.',
  },
  'use-case-wind-campaign': {
    en: 'See how EnviroMET plans a remote wind measurement campaign, combining met masts or LiDAR, field power and communications to assess resource uncertainty.',
    ar: 'تعرّف على مثال لحملة قياس رياح في موقع ناءٍ، مع تحديد ارتفاعات القياس ودمج برج أرصاد أو ليدار بالطاقة والاتصالات لمراجعة المورد وعدم اليقين.',
  },
}

export const legacyUseCaseDescriptions = new Set([
  'An anonymous application of EnviroMET services.',
  'تطبيق لخدمات EnviroMET دون ذكر هوية العميل.',
])

/** Existing CMS records also get the correction on deployment; editor-written copy wins. */
export function resolvePageDescription(
  slug: string | undefined,
  locale: 'en' | 'ar',
  description?: string | null,
): string | undefined {
  const current = description?.trim() || undefined
  if (
    slug &&
    Object.hasOwn(useCaseDescriptions, slug) &&
    current &&
    legacyUseCaseDescriptions.has(current)
  ) {
    return useCaseDescriptions[slug][locale]
  }
  return current
}
