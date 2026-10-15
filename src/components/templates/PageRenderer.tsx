import React from 'react'
import type { Page, Project, Service } from '@/payload-types'
import { getPageBySlug, getProjectBySlug, getServiceBySlug, setRequestLocale, type Locale } from '@/lib/data'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ServiceTemplate } from './ServiceTemplate'
import { ProjectDetail } from './ProjectDetail'
import { LegacyScripts } from '@/components/ui/LegacyScripts.client'

export type Resolved =
  | { kind: 'page'; doc: Page }
  | { kind: 'service'; doc: Service }
  | { kind: 'project'; doc: Project }

/** One flat URL space: /<slug> can be a Page, a Service or a Project. */
export async function resolveSlug(slug: string, locale: Locale): Promise<Resolved | null> {
  setRequestLocale(locale)
  const page = await getPageBySlug(slug, locale)
  if (page) return { kind: 'page', doc: page }
  const service = await getServiceBySlug(slug, locale)
  if (service) return { kind: 'service', doc: service }
  if (locale === 'en') {
    const project = await getProjectBySlug(slug)
    if (project) return { kind: 'project', doc: project }
  }
  return null
}

export function PageRenderer({ resolved }: { resolved: Resolved }) {
  switch (resolved.kind) {
    case 'page':
      return (
        <>
          <RenderBlocks blocks={resolved.doc.layout} />
          {!!resolved.doc.scripts?.length && <LegacyScripts scripts={resolved.doc.scripts} />}
        </>
      )
    case 'service':
      return resolved.doc.customLayout?.length ? (
        <RenderBlocks blocks={resolved.doc.customLayout} />
      ) : (
        <ServiceTemplate service={resolved.doc} />
      )
    case 'project':
      return <ProjectDetail project={resolved.doc} />
  }
}
