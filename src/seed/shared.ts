/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seed helpers for the shared content features:
 *  - findSharedSections: sections that are identical on several pages become one Shared section;
 *  - solutionShared: text that is identical on every solution page moves to the
 *    "Solution pages (shared)" global;
 *  - pageTemplates: the three most common page types become Page templates.
 */

type Block = Record<string, any>
export type LayoutSource = { locale: 'en' | 'ar'; owner: string; layout: Block[] }
export type SharedGroup = { locale: 'en' | 'ar'; title: string; block: Block; uses: { source: LayoutSource; index: number }[] }

const withoutIds = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(withoutIds)
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, x] of Object.entries(v)) if (k !== 'id') out[k] = withoutIds(x)
    return out
  }
  return v
}

/** Friendly library names for the sections found in the original site. */
const names: Record<string, string> = {
  'YOUR NEXT STEP': 'Next step banner (audience pages)',
  'Your next project': 'Next project banner (technical guides)',
  'Technical questions.': 'Technical questions (equipment pages)',
  'Build a clearer business case': 'Build a clearer business case',
  'حدد التطبيق ونطاق التحقق.': 'Application and verification scope (Arabic pages)',
  'Two connected procurement pathways': 'Two connected procurement pathways',
  'Measurement products.': 'Measurement products list',
}

const titleOf = (b: Block) => {
  const key = b.blockType === 'cta' ? b.custom?.eyebrow : b.blockName
  const fallback = String(b.blockName || b.custom?.heading || b.heading || 'Shared section').split('\n')[0]
  return names[key] ?? fallback.replace(/\.$/, '')
}

/**
 * Top-level sections that appear, identical, in two or more layouts of the same language.
 * The default closing banner is skipped: it already comes from Site Settings.
 */
export function findSharedSections(sources: LayoutSource[]): SharedGroup[] {
  const groups = new Map<string, SharedGroup>()
  for (const source of sources)
    source.layout.forEach((block, index) => {
      if (block.blockType === 'cta' && block.useDefault) return
      const key = `${source.locale}:${JSON.stringify(withoutIds(block))}`
      const group = groups.get(key) ?? { locale: source.locale, title: titleOf(block), block, uses: [] }
      group.uses.push({ source, index })
      groups.set(key, group)
    })
  return [...groups.values()].filter((g) => new Set(g.uses.map((u) => u.source.owner)).size > 1)
}

/** Replaces each use with a Shared section block pointing at the library entry. */
export const placeShared = (group: SharedGroup, id: number) => {
  for (const { source, index } of group.uses)
    source.layout[index] = { blockType: 'sharedSection', section: id, blockName: group.block.blockName }
}

/* ---------------- Solution pages ---------------- */

const sameLinks = (a: any[] = [], b: any[] = []) =>
  a.length === b.length && a.every((l, i) => l.label === b[i].label && l.url === b[i].url)

/** The text every solution repeats, read from the first solution. */
export const solutionShared = (first: Block) => ({
  eyebrow: first.eyebrow,
  deliverTitle: first.deliverTitle,
  deliverText: first.deliverText,
  enquiryBox: {
    heading: first.enquiryBox?.heading,
    text: first.enquiryBox?.text,
    buttonLabel: first.enquiryBox?.buttonLabel,
    evidenceTitle: first.enquiryBox?.evidenceTitle,
    evidenceLinks: (first.enquiryBox?.evidenceLinks ?? []).map((l: Block) => ({
      type: 'custom',
      label: l.label,
      url: l.url,
      appearance: l.appearance ?? 'plain',
    })),
  },
})

/** Empties a solution's fields that only repeat the shared text, so they follow the shared version. */
export const stripSharedText = <T extends Block>(s: T, shared: ReturnType<typeof solutionShared>): T => {
  const out: Block = { ...s, enquiryBox: { ...(s.enquiryBox ?? {}) } }
  for (const k of ['eyebrow', 'deliverTitle', 'deliverText'] as const) if (out[k] === shared[k]) delete out[k]
  for (const k of ['heading', 'text', 'buttonLabel', 'evidenceTitle'] as const)
    if (out.enquiryBox[k] === shared.enquiryBox[k]) delete out.enquiryBox[k]
  if (sameLinks(out.enquiryBox.evidenceLinks, shared.enquiryBox.evidenceLinks)) delete out.enquiryBox.evidenceLinks
  return out as T
}

/* ---------------- Page templates ---------------- */

/** The three most common page types on the site, each modelled on a representative page. */
export const pageTemplates = [
  {
    title: 'Expertise page',
    model: 'measurement-expertise',
    pageType: 'expertise',
    sortOrder: 10,
    description:
      'Page intro, a grid of related solutions and the closing banner. Used by the 8 expertise pages (air quality, water, engineering…).',
  },
  {
    title: 'Use case page',
    model: 'use-case-wind-campaign',
    pageType: 'use-case',
    sortOrder: 20,
    description:
      'Page intro, the approach with a sidebar of facts, and the closing banner. Used by the 6 use-case pages.',
  },
  {
    title: 'Equipment page',
    model: 'wind-lidar',
    pageType: 'product',
    sortOrder: 30,
    description:
      'Product intro, "match the system to the site", procurement table and the shared Technical questions. Used by the equipment pages.',
  },
] as const

export { withoutIds }
