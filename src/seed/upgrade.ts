/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Adds the shared-content features to an EXISTING database, without deleting anything:
 *   1. Shared sections: sections that are identical on several pages become one library entry,
 *      and those pages place it by reference (their own text is not changed).
 *   2. Solution pages (shared): default section order + the text every solution repeats.
 *   3. Page templates: the three most common page types.
 *   4. Arabic: every page that only exists in English gets its translated Arabic version.
 * Every step is skipped when it has already been done, so the script is safe to run again.
 *
 *   npm run upgrade            (local SQLite)
 *   deploy-vercel.bat          (runs it against the production database)
 */
import 'dotenv/config'
import { spawnSync } from 'child_process'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { findSharedSections, pageTemplates, placeShared, solutionShared, stripSharedText, withoutIds, type LayoutSource } from './shared'
import { solutionParts } from '../globals/solutionParts'
import { addArabic } from './arabic'
import { upgradeUseCaseSEO } from './seo'

const ctx = { disableRevalidate: true }
type Locale = 'en' | 'ar'
const locales: Locale[] = ['en', 'ar']

async function upgradeSharedSections(payload: Payload) {
  const existing = await payload.count({ collection: 'shared-sections' })
  if (existing.totalDocs) return payload.logger.info(`  shared sections: already set up (${existing.totalDocs})`)

  const all = { locale: 'all' as const, depth: 0, limit: 1000, pagination: false as const }
  const [pages, services] = await Promise.all([
    payload.find({ collection: 'pages', ...all }),
    payload.find({ collection: 'services', ...all }),
  ])

  // Layout sources; `save` writes a changed layout back to its document.
  const sources: (LayoutSource & { save: () => Promise<unknown> })[] = []
  for (const p of pages.docs as any[])
    for (const locale of locales) {
      const layout = p.layout?.[locale]
      if (Array.isArray(layout) && layout.length)
        sources.push({
          locale,
          owner: `page:${p.id}`,
          layout,
          save: () => payload.update({ collection: 'pages', id: p.id, locale, data: { layout } as any, context: ctx }),
        })
    }
  for (const s of services.docs as any[]) {
    if (Array.isArray(s.extraSections) && s.extraSections.length)
      sources.push({
        locale: 'en',
        owner: `service:${s.id}`,
        layout: s.extraSections,
        save: () => payload.update({ collection: 'services', id: s.id, data: { extraSections: s.extraSections }, context: ctx }),
      })
    for (const locale of locales) {
      const layout = s.customLayout?.[locale]
      if (Array.isArray(layout) && layout.length)
        sources.push({
          locale,
          owner: `service:${s.id}`,
          layout,
          save: () => payload.update({ collection: 'services', id: s.id, locale, data: { customLayout: layout } as any, context: ctx }),
        })
    }
  }

  const groups = findSharedSections(sources)
  const changed = new Set<(typeof sources)[number]>()
  for (const group of groups) {
    const doc = await payload.create({
      collection: 'shared-sections',
      locale: group.locale,
      data: { title: group.title, layout: [withoutIds(group.block)] as any },
      context: ctx,
    })
    placeShared(group, doc.id)
    group.uses.forEach((u) => changed.add(u.source as (typeof sources)[number]))
  }
  for (const source of changed) await source.save()
  payload.logger.info(`  shared sections: ${groups.length} created, placed on ${changed.size} page layouts`)
}

async function upgradeSolutionTemplate(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'solution-template', depth: 0 })
  // (`sections` has a default value, so check for saved shared text instead)
  if (current.eyebrow || current.deliverTitle || current.enquiryBox?.heading)
    return payload.logger.info('  solution pages (shared): already set up')

  const services = (await payload.find({ collection: 'services', locale: 'en', depth: 0, limit: 1000, pagination: false })).docs as any[]
  if (!services.length) return
  const shared = solutionShared(services[0])
  const businessCase = (
    await payload.find({ collection: 'shared-sections', where: { title: { equals: 'Build a clearer business case' } }, limit: 1 })
  ).docs[0]?.id

  await payload.updateGlobal({
    slug: 'solution-template',
    data: { sections: solutionParts.map((p) => ({ part: p.value, hidden: false })), ...shared, businessCase } as any,
    context: ctx,
  })
  // Solutions that only repeat the shared text now follow it (edit once, every solution updates).
  let n = 0
  for (const s of services) {
    const stripped = stripSharedText(s, shared)
    const data: any = {}
    for (const k of ['eyebrow', 'deliverTitle', 'deliverText'] as const) if (!(k in stripped) && s[k]) data[k] = null
    const box: any = {}
    for (const k of ['heading', 'text', 'buttonLabel', 'evidenceTitle', 'evidenceLinks'])
      if (!(k in (stripped.enquiryBox ?? {})) && s.enquiryBox?.[k]) box[k] = k === 'evidenceLinks' ? [] : null
    if (Object.keys(box).length) data.enquiryBox = { ...s.enquiryBox, ...box }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'services', id: s.id, locale: 'en', data, context: ctx })
      n++
    }
  }
  payload.logger.info(`  solution pages (shared): set up; ${n} solutions now use the shared text`)
}

async function upgradeTemplates(payload: Payload) {
  const existing = await payload.count({ collection: 'page-templates' })
  if (existing.totalDocs) return payload.logger.info(`  page templates: already set up (${existing.totalDocs})`)
  let made = 0
  for (const t of pageTemplates) {
    const model = (
      await payload.find({ collection: 'pages', where: { slug: { equals: t.model } }, locale: 'all', depth: 0, limit: 1 })
    ).docs[0] as any
    if (!model) continue
    const doc = await payload.create({
      collection: 'page-templates',
      locale: 'en',
      data: { title: t.title, description: t.description, pageType: t.pageType, sortOrder: t.sortOrder, layout: withoutIds(model.layout?.en ?? []) as any },
      context: ctx,
    })
    if (model.layout?.ar?.length)
      await payload.update({ collection: 'page-templates', id: doc.id, locale: 'ar', data: { layout: withoutIds(model.layout.ar) as any }, context: ctx })
    made++
  }
  payload.logger.info(`  page templates: ${made} created`)
}

try {
  // Local SQLite: when new fields were added, the first schema push can stop half-way
  // ("index … already exists"). Let it finish in separate runs before starting here.
  if (!process.env.DATABASE_URI?.startsWith('postgres'))
    for (let i = 0; i < 4; i++) {
      const run = spawnSync(process.execPath, ['--no-deprecation', '--import', 'tsx', 'src/seed/settle.ts'], { stdio: 'ignore' })
      if (run.status === 0) break
    }
  const payload = await getPayload({ config })
  payload.logger.info('Adding shared sections, solution settings and page templates…')
  await upgradeSharedSections(payload)
  await upgradeSolutionTemplate(payload)
  await upgradeTemplates(payload)
  await addArabic(payload) // Arabic version of every page that only exists in English
  await upgradeUseCaseSEO(payload)
  // Local SQLite: run the schema push until it reports no work left (see settle.ts).
  if (!process.env.DATABASE_URI?.startsWith('postgres'))
    for (let i = 0; i < 3; i++) {
      const run = spawnSync(process.execPath, ['--no-deprecation', '--import', 'tsx', 'src/seed/settle.ts'], { stdio: 'ignore' })
      if (run.status === 0 && i > 0) break
    }
  payload.logger.info('Upgrade complete ✔')
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
