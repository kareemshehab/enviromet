/**
 * Seeds the CMS with the full EnviroMET website.
 *
 *   npm run seed     → wipes Pages / Services / Projects / Media / Enquiries and re-imports everything
 *
 * Content sources:
 *   - src/seed/pages/*.ts, services/wind.ts, globals.ts   hand-built pilot pages (Home, About, Projects, Contact, Wind)
 *   - src/seed/import/*.json                              generated from the original HTML by
 *                                                         scripts/import_static_site.py (all other pages + Arabic)
 * Images are uploaded from /public/assets once and shared.
 */
import 'dotenv/config' // load .env first (the config reads it on import)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { homeLayout } from './pages/home'
import { aboutLayout } from './pages/about'
import { projectsLayout } from './pages/projects'
import { contactLayout } from './pages/contact'
import { windService } from './services/wind'
import { headerData, footerData, settingsData } from './globals'
import type { MediaMap } from './helpers'
import { findSharedSections, pageTemplates, placeShared, solutionShared, stripSharedText, withoutIds } from './shared'
import { solutionParts } from '../globals/solutionParts'
import { addArabic } from './arabic'

/* eslint-disable @typescript-eslint/no-explicit-any */
const dirname = path.dirname(fileURLToPath(import.meta.url))
const assets = path.resolve(dirname, '../../public')
const importDir = path.resolve(dirname, 'import')
const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(importDir, f), 'utf-8'))
// Always pass a fresh copy (`{ ...ctx }`): Payload uses the context object by reference and the
// cloud-storage plugin writes flags into it, so a shared object would stop every upload after the first.
const ctx = { disableRevalidate: true }

/** Media used by the hand-built pages, addressed by a short key. */
const mediaFiles: [key: string, file: string, alt: string][] = [
  ['logo', 'assets/logo.png', 'EnviroMET — Towards Better Environment'],
  ['energyHero', 'assets/energy-hero.webp', 'Illustrative wind and solar energy landscape'],
  ['mast', 'assets/mast.jpg', 'EnviroMET met mast in the field'],
  ['solarStation', 'assets/solar_station.webp', 'Illustrative solar measurement station'],
  ['ammonitHero', 'assets/ammonit-kintech-hero.png', 'Ammonit and Kintech logger cabinet installations'],
  ['air', 'assets/air.webp', 'Environmental monitoring'],
  ['composite', 'assets/measurement-composite.webp', 'Combined illustration of wind met mast, solar radiation measurement station and ground-mounted LiDAR'],
  ['lidar', 'assets/lidar.webp', 'LiDAR deployment in the field'],
  ['installationVideo', 'assets/installation.mp4', 'EnviroMET met mast installation footage'],
  ['ministryEnergy', 'assets/references/ministry-energy.png', 'Ministry of Energy'],
  ['acwaPower', 'assets/references/acwa-power.png', 'GOPA Tech / ACWA Power'],
  ['gopaTech', 'assets/references/gopa-tech.png', 'GOPA Tech'],
  ['sepcoiii', 'assets/references/sepcoiii.png', 'SEPCOIII'],
  ['assystem', 'assets/references/assystem.png', 'Assystem / DNEC'],
  ['neom', 'assets/references/neom.png', 'NEOM'],
  ['ncm', 'assets/references/ncm.png', 'National Center for Meteorology'],
  ['kacare', 'assets/references/kacare.png', 'KACARE'],
  ['sec', 'assets/references/saudi-electricity.png', 'Saudi Electricity Company'],
  ['thies', 'assets/references/thies.png', 'Thies CLIMA'],
  ['ammonit', 'assets/references/ammonit.png', 'Ammonit'],
  ['profec', 'assets/references/profec.png', 'ProfEC Ventus'],
  ['kintech', 'assets/references/kintech.png', 'Kintech Engineering'],
  ['ott', 'assets/references/ott.png', 'OTT HydroMet'],
  ['nesa', 'assets/references/nesa.png', 'NESA'],
  ['ecotech', 'assets/references/ecotech.png', 'Ecotech / ACOEM Group'],
  ['zoglab', 'assets/references/zoglab.png', 'ZOGLAB'],
  ['everise', 'assets/references/everise.png', 'EVERISE'],
  ['ramboll', 'assets/references/ramboll.png', 'Ramboll'],
  ['windtec', 'assets/partners/windtec-energia.jpg', 'Windtec Energía'],
  ['vaisala', 'assets/partners/vaisala.jpg', 'Vaisala'],
  ['zxLidars', 'assets/partners/zx-lidars.jpg', 'ZX Lidars'],
  ['measwind', 'assets/partners/measwind.jpg', 'Measwind Renewable Services'],
]

async function wipe(payload: Payload) {
  // Globals are rewritten below anyway. Clear their rows first: Site settings requires a logo, so on
  // Postgres the media delete (which sets that reference to null) would otherwise fail.
  const db = payload.db as any
  for (const table of ['site_settings', 'header', 'footer']) {
    if (db.tables?.[table]) await db.drizzle.delete(db.tables[table])
  }
  // Pages, solutions and templates first: they reference shared sections and media.
  for (const collection of ['pages', 'services', 'projects', 'enquiries', 'page-templates', 'shared-sections', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, context: { ...ctx } })
  }
}

/** Removes nulls so optional groups/fields are simply left empty. */
const clean = (v: any): any => {
  if (Array.isArray(v)) return v.map(clean)
  if (v && typeof v === 'object') {
    const out: any = {}
    for (const [k, x] of Object.entries(v)) if (x !== null && x !== undefined) out[k] = clean(x)
    return out
  }
  return v
}

async function seed() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding EnviroMET content…')
  await wipe(payload)

  /* 1. Media ---------------------------------------------------------------- */
  const byPath = new Map<string, number>()
  const upload = async (file: string, alt: string) => {
    const key = file.replace(/^\//, '')
    if (byPath.has(key)) return byPath.get(key)!
    const doc = await payload.create({
      collection: 'media',
      data: { alt: alt || path.basename(key).replace(/[-_]/g, ' ').replace(/\.\w+$/, '') },
      filePath: path.join(assets, key),
      context: { ...ctx },
    })
    byPath.set(key, doc.id)
    return doc.id
  }
  const media: MediaMap = {}
  for (const [key, file, alt] of mediaFiles) media[key] = await upload(file, alt)

  const projectIds: Record<string, number> = {}
  const serviceIds: Record<string, number> = {}

  /** Replaces {"$media": path} / {"$service": slug} / {"$project": slug} references with document ids. */
  const resolve = async (v: any): Promise<any> => {
    if (Array.isArray(v)) return Promise.all(v.map(resolve))
    if (v && typeof v === 'object') {
      if ('$media' in v) return upload(v.$media, v.alt)
      if ('$service' in v) return serviceIds[v.$service]
      if ('$project' in v) return projectIds[v.$project]
      const out: any = {}
      for (const [k, x] of Object.entries(v)) out[k] = await resolve(x)
      return out
    }
    return v
  }

  /* 2. Projects (card + detail page) ---------------------------------------- */
  for (const p of readJson('projects.json')) {
    const doc = await payload.create({ collection: 'projects', data: clean(await resolve(p)), context: { ...ctx } })
    projectIds[p.slug] = doc.id
    projectIds[p.slug.replace(/^project-/, '')] = doc.id // short keys used by the hand-built pages
  }
  payload.logger.info(`  projects: ${Object.keys(projectIds).length / 2}`)

  /* 3. Shared sections ----------------------------------------------------- */
  // Sections that are identical on several pages are stored once and placed by reference.
  const pagesJson = readJson('pages.json')
  const servicesJson = readJson('services.json')
  const arabicJson = readJson('arabic.json')
  const groups = findSharedSections([
    ...pagesJson.map((p: any) => ({ locale: 'en' as const, owner: `page:${p.slug}`, layout: p.layout ?? [] })),
    ...servicesJson.map((s: any) => ({ locale: 'en' as const, owner: `service:${s.slug}`, layout: s.extraSections ?? [] })),
    ...arabicJson.map((a: any) => ({ locale: 'ar' as const, owner: `${a.collection}:${a.slug}`, layout: a.layout ?? [] })),
  ])
  let businessCaseId: number | undefined
  for (const group of groups) {
    const doc = await payload.create({
      collection: 'shared-sections',
      locale: group.locale,
      data: { title: group.title, layout: [clean(await resolve(group.block))] },
      context: { ...ctx },
    })
    placeShared(group, doc.id)
    if (group.block.blockName === 'Build a clearer business case') businessCaseId = doc.id
  }
  payload.logger.info(`  shared sections: ${groups.length} (${groups.reduce((n, g) => n + g.uses.length, 0)} placements)`)

  /* 4. Services -------------------------------------------------------------- */
  // Text repeated on every solution moves to the "Solution pages (shared)" global.
  const sharedText = solutionShared(servicesJson[0])
  await payload.updateGlobal({
    slug: 'solution-template',
    data: {
      sections: solutionParts.map((p) => ({ part: p.value, hidden: false })),
      ...sharedText,
      businessCase: businessCaseId,
    } as any,
    context: { ...ctx },
  })
  const windCard = readJson('wind-card.json')
  const wind = {
    ...stripSharedText(windService(media, projectIds), sharedText),
    summary: windCard.summary,
    cardImage: await resolve(windCard.cardImage),
    cardImageAlt: windCard.cardImageAlt,
    sortOrder: windCard.sortOrder,
    showBusinessCase: true,
  }
  serviceIds.wind = (await payload.create({ collection: 'services', data: { ...wind, _status: 'published' } as any, context: { ...ctx } })).id
  for (const s of servicesJson) {
    const doc = await payload.create({
      collection: 'services',
      data: clean({ ...(await resolve(stripSharedText(s, sharedText))), _status: 'published' }),
      context: { ...ctx },
    })
    serviceIds[s.slug] = doc.id
  }
  payload.logger.info(`  services: ${Object.keys(serviceIds).length}`)

  /* 5. Pages ------------------------------------------------------------------ */
  const nameBlocks = (layout: Record<string, unknown>[]) =>
    layout.map((b) => {
      if (b.blockName) return b
      const slides = b.slides as { eyebrow?: string }[] | undefined
      const label = (b.eyebrow || slides?.[0]?.eyebrow || (b.heading as string | undefined)?.split('\n')[0] || '') as string
      return { ...b, blockName: label ? label.charAt(0) + label.slice(1).toLowerCase() : undefined }
    })

  const handmade = [
    {
      title: 'Home',
      slug: 'home',
      pageType: 'general',
      layout: homeLayout(media, projectIds),
      meta: {
        title: 'Wind, Solar & Environmental Measurement | EnviroMET Saudi Arabia',
        description:
          'Saudi-based wind and solar resource measurement, met masts, LiDAR, environmental monitoring and engineering support. Explore EnviroMET’s documented projects.',
        image: media.energyHero,
      },
    },
    {
      title: 'About EnviroMET',
      slug: 'about',
      pageType: 'general',
      layout: aboutLayout(media),
      meta: {
        title: 'About EnviroMET | Saudi Measurement & Engineering Expertise',
        description:
          'Explore EnviroMET’s experience since 2014, five fields of expertise, documented Saudi project references, management systems and company profiles.',
      },
    },
    {
      title: 'Projects',
      slug: 'projects',
      pageType: 'hub',
      layout: projectsLayout(),
      meta: {
        title: 'Met Mast, LiDAR & Monitoring Project References | EnviroMET',
        description: 'Selected EnviroMET project references: wind masts, LiDAR, meteorological networks and station maintenance.',
      },
    },
    {
      title: 'Contact',
      slug: 'contact',
      pageType: 'general',
      layout: contactLayout(),
      meta: {
        title: 'Contact EnviroMET | Measurement & Engineering Project Enquiries',
        description:
          'Discuss your site, project stage and measurement or technical-review requirements with EnviroMET. Saudi-based team; regional project enquiries welcome.',
      },
    },
  ]
  const pageIds: Record<string, number> = {}
  for (const page of handmade) {
    const data = { ...page, layout: nameBlocks(page.layout as Record<string, unknown>[]), _status: 'published' }
    pageIds[page.slug] = (await payload.create({ collection: 'pages', data: data as any, context: { ...ctx } })).id
  }
  for (const page of pagesJson) {
    const data = clean({ ...(await resolve(page)), _status: 'published' })
    pageIds[page.slug] = (await payload.create({ collection: 'pages', data, context: { ...ctx } })).id
  }
  payload.logger.info(`  pages: ${Object.keys(pageIds).length}`)

  /* 6. Arabic versions ------------------------------------------------------- */
  for (const ar of arabicJson) {
    const layout = clean(await resolve(ar.layout))
    if (ar.collection === 'pages') {
      await payload.update({
        collection: 'pages',
        id: pageIds[ar.slug],
        locale: 'ar',
        data: { title: ar.title, layout, meta: clean(ar.meta), _status: 'published' } as any,
        context: { ...ctx },
      })
    } else {
      await payload.update({
        collection: 'services',
        id: serviceIds[ar.slug],
        locale: 'ar',
        data: { title: ar.title, customLayout: layout, meta: clean(ar.meta), _status: 'published' } as any,
        context: { ...ctx },
      })
    }
  }
  payload.logger.info('  arabic: 9 pages')

  /* 7. Globals (EN + AR) ----------------------------------------------------- */
  await payload.updateGlobal({ slug: 'site-settings', data: settingsData(media) as any, context: { ...ctx } })
  await payload.updateGlobal({ slug: 'header', data: headerData() as any, context: { ...ctx } })
  await payload.updateGlobal({ slug: 'footer', data: footerData() as any, context: { ...ctx } })
  const ar = readJson('globals-ar.json')
  await payload.updateGlobal({ slug: 'site-settings', locale: 'ar', data: clean(ar.settings), context: { ...ctx } })
  await payload.updateGlobal({ slug: 'header', locale: 'ar', data: clean(ar.header), context: { ...ctx } })
  await payload.updateGlobal({ slug: 'footer', locale: 'ar', data: clean(ar.footer), context: { ...ctx } })
  payload.logger.info('  globals: header, footer, site settings (EN + AR)')

  /* 8. Page templates: the three most common page types --------------------- */
  for (const t of pageTemplates) {
    const model = await payload.findByID({ collection: 'pages', id: pageIds[t.model], locale: 'all', depth: 0 })
    const layout = model.layout as unknown as { en?: unknown[]; ar?: unknown[] }
    const template = await payload.create({
      collection: 'page-templates',
      locale: 'en',
      data: { title: t.title, description: t.description, pageType: t.pageType, sortOrder: t.sortOrder, layout: withoutIds(layout.en ?? []) as any },
      context: { ...ctx },
    })
    if (layout.ar?.length)
      await payload.update({ collection: 'page-templates', id: template.id, locale: 'ar', data: { layout: withoutIds(layout.ar) as any }, context: { ...ctx } })
  }
  payload.logger.info(`  page templates: ${pageTemplates.length}`)

  /* 8b. Arabic version of every page that only exists in English --------------- */
  await addArabic(payload)

  /* 9. First admin user (only if none exists) -------------------------------- */
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    // Production deploys pass the admin login through SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@enviromet.local'
    const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!2026'
    await payload.create({ collection: 'users', data: { email, password, name: 'EnviroMET Admin' } })
    payload.logger.info(
      process.env.SEED_ADMIN_PASSWORD
        ? `  admin user: ${email} (password from SEED_ADMIN_PASSWORD)`
        : `  admin user: ${email} / ${password}  (change this password!)`,
    )
  }

  /* 10. Production: confirm every image (and size) really is in Vercel Blob ---- */
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase()
  if (process.env.PAYLOAD_USE_BLOB === 'true' && storeId) {
    const base = `https://${storeId}.public.blob.vercel-storage.com`
    const all = await payload.find({ collection: 'media', limit: 1000, depth: 0, pagination: false })
    const names = all.docs.flatMap((d: any) => [
      d.filename,
      ...Object.values(d.sizes || {}).map((s: any) => s?.filename),
    ]).filter(Boolean) as string[]
    const missing: string[] = []
    for (const n of names) {
      const r = await fetch(`${base}/${encodeURIComponent(n)}`, { method: 'HEAD' }).catch(() => null)
      if (!r || !r.ok) missing.push(n)
    }
    if (missing.length) throw new Error(`${missing.length} of ${names.length} image files are missing in Blob storage, e.g. ${missing.slice(0, 5).join(', ')}`)
    payload.logger.info(`  images: all ${names.length} files confirmed in Blob storage`)
  }

  payload.logger.info(`Seed complete ✔  (${byPath.size} media files)`)
  process.exit(0)
}

// Top-level await: `payload run` exits as soon as the module finishes loading.
try {
  await seed()
} catch (err) {
  console.error(err)
  process.exit(1)
}
