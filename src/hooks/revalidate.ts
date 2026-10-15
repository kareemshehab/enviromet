import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * On-demand revalidation: when an editor saves in the admin panel, Next.js
 * throws away the cached HTML for the affected route(s) so the next visit
 * renders fresh content from the CMS.
 *
 * `context.disableRevalidate` is set by the seed script, which runs outside Next.js.
 */
const safeRevalidate = (path: string, type?: 'layout' | 'page') => {
  try {
    revalidatePath(path, type)
  } catch {
    // Called outside a Next.js request (e.g. CLI scripts) — nothing to revalidate.
  }
}

export const pathForSlug = (slug?: string | null) => (!slug || slug === 'home' ? '/' : `/${slug}`)
const arabicPathForSlug = (slug?: string | null) => (!slug || slug === 'home' ? '/ar' : `/ar/${slug}`)

/** A document can be shown in English (/x) and Arabic (/ar/x): refresh both. */
const revalidateSlug = (slug?: string | null) => {
  safeRevalidate(pathForSlug(slug))
  safeRevalidate(arabicPathForSlug(slug))
}

export const revalidateDocument: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (req.context?.disableRevalidate) return doc
  if (doc._status === 'published' || doc._status === undefined) revalidateSlug(doc.slug)
  // Slug changed or document unpublished: refresh the old URL too.
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidateSlug(previousDoc.slug)
  if (previousDoc?._status === 'published' && doc._status !== 'published') revalidateSlug(doc.slug)
  return doc
}

export const revalidateDocumentDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) revalidateSlug(doc?.slug)
  return doc
}

/** Shared content (projects, media, header, footer, settings) can appear on any page. */
export const revalidateEverything: CollectionAfterChangeHook & GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) safeRevalidate('/', 'layout')
  return doc
}

export const revalidateEverythingDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) safeRevalidate('/', 'layout')
  return doc
}

/**
 * Pages placed in the main menu (Pages → "Show in menu") appear in the header of every page:
 * refresh the whole site when a placed page is published, unpublished, renamed or moved.
 */
export const revalidateMenu: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (req.context?.disableRevalidate) return doc
  const placed = (d?: Record<string, unknown> | null) =>
    d?.menuColumn && d._status === 'published' ? [d.menuColumn, d.menuLabel, d.title, d.slug].join('|') : ''
  if (placed(doc) !== placed(previousDoc)) safeRevalidate('/', 'layout')
  return doc
}
