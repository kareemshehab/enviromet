import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageRenderer, resolveSlug } from '@/components/templates/PageRenderer'
import { getStaticSlugs } from '@/lib/data'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug?: string[] }> }

export async function generateStaticParams() {
  return [{ slug: [] }, ...(await getStaticSlugs('ar')).map((slug) => ({ slug: [slug] }))]
}

export const dynamicParams = true

const slugOf = (s?: string[]) => (s?.length ? s.join('/') : 'home')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = slugOf((await params).slug)
  const found = await resolveSlug(slug, 'ar')
  return buildMetadata(found?.doc ?? null, slug === 'home' ? '/ar' : `/ar/${slug}`, 'ar')
}

export default async function ArabicPage({ params }: Props) {
  const slug = slugOf((await params).slug)
  const found = await resolveSlug(slug, 'ar')
  if (!found) notFound()
  return <PageRenderer resolved={found} />
}
