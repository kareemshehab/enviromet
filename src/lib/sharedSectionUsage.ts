import type { Payload, PayloadRequest } from 'payload'

export type SharedSectionUse = { label: string; href: string }

type Block = { blockType?: string; section?: unknown }
const idOf = (v: unknown) => String(v && typeof v === 'object' ? (v as { id?: unknown }).id : v)
const usesSection = (layout: unknown, id: string) =>
  Array.isArray(layout) && (layout as Block[]).some((b) => b?.blockType === 'sharedSection' && idOf(b.section) === id)
/** Localized fields come back as { en: [...], ar: [...] } with locale 'all'. */
const perLocale = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.values(v) : [v])
const titleOf = (t: unknown) => (t && typeof t === 'object' ? ((t as Record<string, string>).en ?? '') : String(t ?? ''))

/** Every page, solution, template and setting that places a given shared section (drafts included). */
export async function findSharedSectionUsage(payload: Payload, id: number | string, req?: PayloadRequest) {
  const key = String(id)
  const common = { locale: 'all' as const, depth: 0, limit: 1000, pagination: false as const, draft: true, req }
  const [pages, services, templates, solution] = await Promise.all([
    payload.find({ collection: 'pages', ...common, select: { title: true, slug: true, layout: true } }),
    payload.find({ collection: 'services', ...common, select: { title: true, slug: true, extraSections: true, customLayout: true } }),
    payload.find({ collection: 'page-templates', ...common, select: { title: true, layout: true } }),
    payload.findGlobal({ slug: 'solution-template', depth: 0, req }),
  ])
  const uses: SharedSectionUse[] = []
  for (const p of pages.docs)
    if (perLocale(p.layout).some((l) => usesSection(l, key)))
      uses.push({ label: titleOf(p.title) || p.slug, href: `/admin/collections/pages/${p.id}` })
  for (const s of services.docs)
    if ([s.extraSections, ...perLocale(s.customLayout)].some((l) => usesSection(l, key)))
      uses.push({ label: `${titleOf(s.title) || s.slug} (solution)`, href: `/admin/collections/services/${s.id}` })
  for (const t of templates.docs)
    if (perLocale(t.layout).some((l) => usesSection(l, key)))
      uses.push({ label: `${t.title} (page template)`, href: `/admin/collections/page-templates/${t.id}` })
  if (solution.businessCase && idOf(solution.businessCase) === key)
    uses.push({ label: 'Solution pages: business case strip', href: '/admin/globals/solution-template' })
  return uses
}
