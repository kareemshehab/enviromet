/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Creates the Arabic version of every page that only exists in English.
 *
 *  - Pages and shared sections: the English sections, with every text translated.
 *  - Solutions, projects and the projects hub (English uses a fixed template): the same page as
 *    editable sections (translations/template-blocks.en.json, made by
 *    scripts/arabic/template_to_blocks.py), translated.
 *  - Links to other pages point to their Arabic version (/x → /ar/x).
 *
 * Texts come from translations/ar.json (English → Arabic). Anything that already has Arabic
 * content is never changed. Safe to run again: it only fills what is still missing.
 */
import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

type Json = any
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'translations')
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const ctx = { disableRevalidate: true }

/** Keys holding technical values (class names, urls, options): never translated. */
const TECH = new Set([
  'blockType', 'id', 'blockName', 'className', 'sectionClass', 'wrapClass', 'wrapperClass', 'anchorId',
  'elementId', 'level', 'tag', 'sectionTag', 'layout', 'background', 'appearance', 'type', 'source',
  'filter', 'variant', 'style', 'kind', 'gridClass', 'cardClass', 'imageFit', 'relationTo', '$mediaFile',
  'arrowSpan', 'target', 'rel', 'slug', 'enquiryKey', 'key', 'width', 'height', 'hidden', 'figureClass', 'linkClass',
])
const URL_KEYS = new Set(['url', 'href'])
const ATTR_TEXT = new Set(['aria-label', 'title', 'placeholder', 'alt', 'data-label'])

/** /solar → /ar/solar (site pages only; files, API, anchors and external links unchanged). */
export const arabicUrl = (u: string) => {
  if (!u.startsWith('/') || u.startsWith('//') || /^\/(ar(\/|$|\?|#)|api\/|assets\/|admin|_next\/)/.test(u)) return u
  if (/^\/[^?#]*\.[a-z0-9]+([?#]|$)/i.test(u)) return u
  return u === '/' ? '/ar' : `/ar${u}`
}

const normaliseMediaName = (name: string) => name.replace(/-\d+(?=(-\d+x\d+)?\.[a-z0-9]+$)/i, '')

export async function addArabic(payload: Payload) {
  const dict: Record<string, string> = read('ar.json')
  const templateBlocks: Record<string, Json[]> = read('template-blocks.en.json')
  const missing = new Map<string, number>()

  /* Media: the converted templates name images by file; resolve them in THIS database. */
  const media = (await payload.find({ collection: 'media', limit: 2000, depth: 0, pagination: false })).docs as Json[]
  const byName = new Map<string, { id: number; file: string }>()
  for (const m of media)
    for (const file of [m.filename, ...Object.values(m.sizes ?? {}).map((s: Json) => s?.filename)])
      if (file) {
        byName.set(file, { id: m.id, file })
        if (!byName.has(normaliseMediaName(file))) byName.set(normaliseMediaName(file), { id: m.id, file })
      }
  const findMedia = (name: string) => byName.get(name) ?? byName.get(normaliseMediaName(name))
  const fixMediaUrls = (html: string) =>
    html.replace(/(?:https?:\/\/[^/"'\s]+)?\/api\/media\/file\/([^"'\s?,]+)/g, (all, name) => {
      const hit = findMedia(decodeURIComponent(name))
      return hit ? `/api/media/file/${encodeURIComponent(hit.file)}` : all
    })

  const tr = (s: string) => {
    const t = dict[s.trim()]
    if (t === undefined) {
      if (/[A-Za-z]{2,}/.test(s)) missing.set(s, (missing.get(s) ?? 0) + 1)
      return s
    }
    return s.replace(s.trim(), t)
  }
  const fixHtml = (s: string) =>
    fixMediaUrls(s.replace(/href="([^"]*)"/g, (_m, u) => `href="${arabicUrl(u)}"`))

  /** Deep copy with Arabic texts, Arabic links and resolved media. Row ids are dropped. */
  const translate = (v: Json, key?: string): Json => {
    if (Array.isArray(v)) return v.map((x) => translate(x, key))
    if (v && typeof v === 'object') {
      if ('$mediaFile' in v) return findMedia(v.$mediaFile)?.id ?? null
      if (v.blockType === 'itemHtml' && /\bproject-filter\b/.test(v.className ?? '') && !v.attrs?.['data-filter']) {
        // Filter buttons keep the English category as a technical value (cards are tagged with it).
        const label = String(v.html ?? '').replace(/&amp;/g, '&').trim()
        v = { ...v, attrs: { ...v.attrs, 'data-filter': label === 'All projects' ? 'all' : label } }
      }
      const out: Json = {}
      for (const [k, x] of Object.entries(v)) {
        if (k === 'id') continue
        if (k === 'attrs' && x && typeof x === 'object' && !Array.isArray(x)) {
          out.attrs = Object.fromEntries(
            Object.entries(x as Json).map(([a, val]) => [
              a,
              typeof val === 'string' && ATTR_TEXT.has(a) ? tr(val) : typeof val === 'string' && a === 'href' ? arabicUrl(val) : val,
            ]),
          )
        } else if (URL_KEYS.has(k) && typeof x === 'string') out[k] = arabicUrl(x)
        else if (TECH.has(k)) out[k] = x
        else out[k] = translate(x, k)
      }
      return out
    }
    if (typeof v === 'string') {
      const t = tr(v)
      return /href=|\/api\/media\/file\//.test(t) ? fixHtml(t) : t
    }
    return v
  }

  /* Card grids that list solutions from the CMS: in Arabic they become fixed, translated cards. */
  const services = (
    await payload.find({ collection: 'services', locale: 'en', depth: 0, limit: 500, pagination: false, sort: 'sortOrder', where: { _status: { equals: 'published' } } })
  ).docs as Json[]
  const serviceCards = (ids?: Json[]) => {
    const chosen = ids?.length ? ids.map((i) => services.find((s) => s.id === (typeof i === 'object' ? i.id : i))).filter(Boolean) : services
    return chosen.map((s: Json) => ({
      title: s.title,
      eyebrow: s.category,
      category: s.category,
      text: s.summary ?? s.solutionIntro,
      url: `/${s.slug}`,
      image: s.cardImage ?? s.heroImage,
      imageAlt: s.cardImageAlt ?? `${s.title} equipment or assessment use case`,
    }))
  }
  const materialiseCards = (v: Json): Json => {
    if (Array.isArray(v)) return v.map(materialiseCards)
    if (v && typeof v === 'object') {
      const out: Json = {}
      for (const [k, x] of Object.entries(v)) out[k] = materialiseCards(x)
      if (out.blockType === 'itemCards' && out.source !== 'manual') {
        out.cards = serviceCards(out.services)
        out.source = 'manual'
        delete out.services
      }
      return out
    }
    return v
  }
  const toArabic = (layout: Json[]) => translate(materialiseCards(layout))
  const metaAr = (meta: Json) =>
    meta ? { ...translate({ title: meta.title, description: meta.description }), image: meta.image ?? undefined } : undefined
  const done: string[] = []

  /* 1. Shared sections (pages reference them, so they come first) */
  const shared = (await payload.find({ collection: 'shared-sections', locale: 'all', depth: 0, limit: 200, pagination: false })).docs as Json[]
  for (const s of shared)
    if (s.layout?.en?.length && !s.layout?.ar?.length) {
      await payload.update({ collection: 'shared-sections', id: s.id, locale: 'ar', data: { layout: toArabic(s.layout.en) }, context: ctx })
      done.push(`shared section: ${s.title}`)
    }

  /* 2. Pages */
  const pages = (await payload.find({ collection: 'pages', locale: 'all', depth: 0, limit: 1000, pagination: false })).docs as Json[]
  for (const p of pages) {
    if (p.layout?.ar?.length) continue // already has Arabic: leave it alone
    const source = templateBlocks[`pages:${p.slug}`] ?? p.layout?.en
    if (!source?.length || !p.title?.en || !dict[p.title.en.trim()]) continue // not one of the site's pages (e.g. a new test page)
    const layout = toArabic(source)
    const data: Json = { title: tr(p.title.en), layout, meta: metaAr(p.meta?.en) }
    // Section-built pages with filter buttons (the projects hub) need the filter behaviour.
    if (JSON.stringify(layout).includes('"data-filter"')) data.scripts = [...new Set([...(p.scripts ?? []), 'filters'])]
    await payload.update({ collection: 'pages', id: p.id, locale: 'ar', data, context: ctx })
    done.push(`page: /ar/${p.slug === 'home' ? '' : p.slug}`)
  }

  /* 3. Solutions and projects: their English page is a template, the Arabic page is sections */
  for (const collection of ['services', 'projects'] as const) {
    const docs = (await payload.find({ collection, locale: 'all', depth: 0, limit: 500, pagination: false })).docs as Json[]
    for (const d of docs) {
      if (d.customLayout?.ar?.length) continue
      const blocks = templateBlocks[`${collection}:${d.slug}`]
      if (!blocks) continue
      const title = typeof d.title === 'object' ? d.title.en : d.title
      const data: Json = { customLayout: toArabic(blocks), meta: metaAr(d.meta?.en ?? d.meta) }
      if (collection === 'services') data.title = tr(title)
      await payload.update({ collection, id: d.id, locale: 'ar', data, context: ctx })
      done.push(`${collection === 'services' ? 'solution' : 'project'}: /ar/${d.slug}`)
    }
  }

  /* 4. Page templates: their Arabic sections, from the translated English ones */
  const templates = (await payload.find({ collection: 'page-templates', locale: 'all', depth: 0, limit: 100, pagination: false })).docs as Json[]
  for (const t of templates)
    if (t.layout?.en?.length && !t.layout?.ar?.length) {
      await payload.update({ collection: 'page-templates', id: t.id, locale: 'ar', data: { layout: toArabic(t.layout.en) }, context: ctx })
      done.push(`template: ${t.title}`)
    }

  done.push(...(await linkToArabicPages(payload)))

  payload.logger.info(`  arabic: ${done.length} added${done.length ? ` (${done.slice(0, 4).join(', ')}${done.length > 4 ? ', …' : ''})` : ''}`)
  if (missing.size)
    payload.logger.warn(`  arabic: ${missing.size} texts had no translation and stay in English, e.g. ${[...missing.keys()].slice(0, 3).map((s) => JSON.stringify(s.slice(0, 60))).join(', ')}`)
  return { added: done, untranslated: [...missing.keys()] }
}

/**
 * Arabic content that still links to English pages (e.g. the Arabic pages written before the
 * translation): point those links to the Arabic version, only when that version exists.
 * Only links change; text, layout and the header's language switch are left as they are.
 */
export async function linkToArabicPages(payload: Payload) {
  const find = (collection: 'pages' | 'services' | 'projects' | 'shared-sections') =>
    payload.find({ collection, locale: 'ar', fallbackLocale: false, depth: 0, limit: 1000, pagination: false }).then((r) => r.docs as Json[])
  const [pages, services, projects, shared] = await Promise.all([find('pages'), find('services'), find('projects'), find('shared-sections')])

  const arabic = new Set<string>()
  for (const p of pages) if (p.layout?.length) arabic.add(p.slug)
  for (const d of [...services, ...projects]) if (d.customLayout?.length) arabic.add(d.slug)

  const toArabic = (u: string) => {
    const target = arabicUrl(u)
    if (target === u) return u
    const slug = u.split(/[?#]/)[0].replace(/^\/|\/$/g, '') || 'home'
    return arabic.has(slug) ? target : u
  }
  /** "Project references — English ↗" → "Project references ↗": the link no longer leads to English. */
  const NOTES: [RegExp, string][] = [
    [/\s*—\s*تفاصيل بالإنجليزية\./g, '.'],
    [/\s*—\s*(?:الإنجليزية|English)(?=\s*↗|\s*$|\s*<\/a>)/g, ''],
    [/^Use cases$/, 'حالات الاستخدام'],
    [/^صفحات التفاصيل الفنية بالإنجليزية، مع صفحات عربية للخدمات الرئيسية\.$/, 'لكل خدمة صفحة تفاصيل فنية خاصة بها.'],
    [/^صفحات التفاصيل الفنية بالإنجليزية، مع صفحات عربية للخدمات ال…$/, 'لكل خدمة صفحة تفاصيل فنية خاصة بها.'],
  ]
  const dropNote = (s: string) => NOTES.reduce((t, [re, to]) => t.replace(re, to), s)
  const leadsToEnglish = (s: string) => [...s.matchAll(/href="([^"]*)"/g)].some(([, u]) => arabicUrl(u) !== u)

  let changed = false
  const rewrite = (v: Json, key?: string): Json => {
    if (Array.isArray(v)) return v.map((x) => rewrite(x, key))
    if (v && typeof v === 'object') {
      if (v.lang === 'en' || /language-switch/.test(v.className ?? '')) return v // the "English" switch stays English
      const out: Json = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rewrite(x, k)]))
      const linkIsArabic = typeof out.url === 'string' && out.url.startsWith('/ar')
      for (const k of ['label', 'blockName', 'text'] as const) {
        if (typeof out[k] !== 'string') continue
        const html = out[k].includes('href="')
        if (k === 'label' && !linkIsArabic) continue
        if (html && leadsToEnglish(out[k])) continue
        const clean = dropNote(out[k])
        if (clean !== out[k]) {
          out[k] = clean
          changed = true
        }
      }
      return out
    }
    if (typeof v !== 'string') return v
    const out =
      key === 'url' || key === 'href'
        ? toArabic(v)
        : v.includes('href="')
          ? v.replace(/href="([^"]*)"/g, (_m, u) => `href="${toArabic(u)}"`)
          : v
    if (out !== v) changed = true
    return out
  }
  const fixed = (value: Json) => {
    changed = false
    const out = rewrite(value)
    return changed ? out : null
  }

  const done: string[] = []
  const ctx = { disableRevalidate: true }
  for (const p of pages) {
    const layout = p.layout?.length && fixed(p.layout)
    if (layout) {
      await payload.update({ collection: 'pages', id: p.id, locale: 'ar', data: { layout }, context: ctx })
      done.push(`links: /ar/${p.slug === 'home' ? '' : p.slug}`)
    }
  }
  for (const [collection, docs] of [['services', services], ['projects', projects]] as const)
    for (const d of docs) {
      const customLayout = d.customLayout?.length && fixed(d.customLayout)
      if (customLayout) {
        await payload.update({ collection, id: d.id, locale: 'ar', data: { customLayout }, context: ctx })
        done.push(`links: /ar/${d.slug}`)
      }
    }
  for (const s of shared) {
    const layout = s.layout?.length && fixed(s.layout)
    if (layout) {
      await payload.update({ collection: 'shared-sections', id: s.id, locale: 'ar', data: { layout }, context: ctx })
      done.push(`links: shared section ${s.title}`)
    }
  }
  const globals = { header: ['navItems', 'cta'], footer: ['columns', 'contactColumn', 'bottomLinks'] } as const
  for (const [slug, fields] of Object.entries(globals) as [keyof typeof globals, readonly string[]][]) {
    const g = (await payload.findGlobal({ slug, locale: 'ar', fallbackLocale: false, depth: 0 })) as Json
    const data: Json = {}
    for (const f of fields) {
      const v = g[f] && fixed(g[f])
      if (v) data[f] = v
    }
    if (Object.keys(data).length) {
      await payload.updateGlobal({ slug, locale: 'ar', data, context: ctx })
      done.push(`links: ${slug}`)
    }
  }
  return done
}
