import type { Endpoint, PayloadRequest } from 'payload'
import { formatSlug } from '@/lib/slug'

type Json = Record<string, unknown>
type Layouts = { en: Json[]; ar: Json[]; pageType: string }

/** Copies blocks without their row ids, so the page gets fresh ones. */
const withoutIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withoutIds)
  if (value && typeof value === 'object') {
    const out: Json = {}
    for (const [k, v] of Object.entries(value)) if (k !== 'id') out[k] = withoutIds(v)
    return out
  }
  return value
}

const readBody = async (req: PayloadRequest) =>
  ((await req.json?.().catch(() => null)) ?? {}) as { title?: unknown; template?: unknown }

/** The template's sections in both languages. The page intro takes the page title. */
async function templateLayouts(req: PayloadRequest, templateId: unknown, title: string): Promise<Layouts> {
  if (!templateId) return { en: [], ar: [], pageType: 'general' }
  const template = await req.payload.findByID({
    collection: 'page-templates',
    id: String(templateId),
    locale: 'all',
    depth: 0,
    req,
  })
  const layout = (template.layout ?? {}) as { en?: Json[]; ar?: Json[] }
  const en = (withoutIds(layout.en ?? []) as Json[]).map((block, i) =>
    i === 0 && title && block.blockType === 'pageIntro' ? { ...block, heading: title } : block,
  )
  return { en, ar: withoutIds(layout.ar ?? []) as Json[], pageType: template.pageType ?? 'general' }
}

/** A unique slug from the title: "wind-lidar", then "wind-lidar-2", … (ignores the page itself). */
async function uniqueSlug(req: PayloadRequest, title: string, ownId?: number | string) {
  const base = formatSlug(title) || 'new-page'
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const taken = await req.payload.find({
      collection: 'pages',
      where: ownId ? { and: [{ slug: { equals: slug } }, { id: { not_equals: ownId } }] } : { slug: { equals: slug } },
      draft: true,
      limit: 1,
      depth: 0,
      pagination: false,
      select: {},
      req,
    })
    if (!taken.docs.length) return slug
  }
}

/**
 * POST /api/pages/from-template  { title, template? }
 * Creates a draft page with the template's sections (English and Arabic). Used by the
 * "Start a new page" panel on the Pages list. Responds with the new page id.
 */
export const createPageFromTemplate: Endpoint = {
  path: '/from-template',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    const body = await readBody(req)
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) return Response.json({ error: 'Enter a page title.' }, { status: 400 })

    const { en, ar, pageType } = await templateLayouts(req, body.template, title)
    const slug = await uniqueSlug(req, title)
    const page = await req.payload.create({
      collection: 'pages',
      data: { title, slug, pageType: pageType as never, layout: en as never, _status: 'draft' },
      draft: true,
      locale: 'en',
      req,
    })
    if (ar.length)
      await req.payload.update({ collection: 'pages', id: page.id, data: { layout: ar as never }, draft: true, locale: 'ar', req })
    return Response.json({ id: page.id, slug })
  },
}

/**
 * POST /api/pages/:id/apply-template  { template, title? }
 * Fills an EMPTY page (e.g. one just made with "Create New") with a template's sections.
 * Refuses when the page already has sections, so nothing is ever overwritten.
 */
export const applyTemplateToPage: Endpoint = {
  path: '/:id/apply-template',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    const id = req.routeParams?.id as string | undefined
    const body = await readBody(req)
    if (!id || !body.template) return Response.json({ error: 'Choose a template.' }, { status: 400 })

    const page = await req.payload.findByID({ collection: 'pages', id, locale: 'all', draft: true, depth: 0, req })
    const current = (page.layout ?? {}) as unknown as { en?: unknown[]; ar?: unknown[] }
    if (current.en?.length || current.ar?.length)
      return Response.json({ error: 'This page already has sections.' }, { status: 409 })

    const typed = typeof body.title === 'string' ? body.title.trim() : ''
    const pageTitle = (page.title as unknown as Record<string, string> | null)?.en ?? ''
    const title = typed || pageTitle
    const { en, ar, pageType } = await templateLayouts(req, body.template, title)

    const data: Json = { layout: en, pageType }
    if (typed) data.title = typed
    if (title && !page.slug) data.slug = await uniqueSlug(req, title, id)
    await req.payload.update({ collection: 'pages', id, data: data as never, draft: true, locale: 'en', req })
    if (ar.length)
      await req.payload.update({ collection: 'pages', id, data: { layout: ar as never }, draft: true, locale: 'ar', req })
    return Response.json({ id })
  },
}
