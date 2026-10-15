import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageRenderer, resolveSlug } from '@/components/templates/PageRenderer'
import { getStaticSlugs } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }> }

/** Pre-render every published page, service and project at build time. */
export async function generateStaticParams() {
  return (await getStaticSlugs('en')).map((slug) => ({ slug }))
}

// Pages published after the build are rendered on first request.
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await resolveSlug(slug, 'en')
  return buildMetadata(found?.doc ?? null, `/${slug}`, 'en')
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') notFound()
  const found = await resolveSlug(slug, 'en')
  if (!found) notFound()
  return <PageRenderer resolved={found} />
}
