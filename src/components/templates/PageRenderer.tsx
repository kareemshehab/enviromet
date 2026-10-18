import React from 'react'
import type { Page, Project, Service } from '@/payload-types'
import {
  getPageBySlug,
  getProjectBySlug,
  getServiceBySlug,
  getRequestLocale,
  setRequestLocale,
  type Locale,
} from '@/lib/data'
import { StructuredData } from '@/components/StructuredData'
import { pagePath } from '@/lib/seo'
import { serverURL } from '@/lib/serverUrl'
import { resolvePageDescription } from '@/lib/useCaseSEO'
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
  const project = await getProjectBySlug(slug, locale)
  if (project) return { kind: 'project', doc: project }
  return null
}

export function PageRenderer({ resolved }: { resolved: Resolved }) {
  const locale = getRequestLocale()
  const doc = resolved.doc
  const url = new URL(pagePath(doc.slug, locale), serverURL).href
  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${url}#webpage`,
              url,
              name: doc.meta?.title || doc.title,
              description: resolvePageDescription(doc.slug, locale, doc.meta?.description),
              inLanguage: locale,
              dateModified: doc.updatedAt,
              isPartOf: { '@id': `${serverURL}/#website` },
              ...(doc.slug !== 'home' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
            },
            ...(doc.slug === 'home'
              ? []
              : [
                  {
                    '@type': 'BreadcrumbList',
                    '@id': `${url}#breadcrumb`,
                    itemListElement: [
                      {
                        '@type': 'ListItem',
                        position: 1,
                        name: locale === 'ar' ? 'الرئيسية' : 'Home',
                        item: new URL(pagePath('home', locale), serverURL).href,
                      },
                      { '@type': 'ListItem', position: 2, name: doc.title, item: url },
                    ],
                  },
                ]),
          ],
        }}
      />
      <PageContent resolved={resolved} />
    </>
  )
}

function PageContent({ resolved }: { resolved: Resolved }) {
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
      // Arabic project pages are built from sections; English uses the project template.
      return resolved.doc.customLayout?.length ? (
        <RenderBlocks blocks={resolved.doc.customLayout} />
      ) : (
        <ProjectDetail project={resolved.doc} />
      )
  }
}
