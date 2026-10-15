import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageRenderer, resolveSlug } from '@/components/templates/PageRenderer'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const found = await resolveSlug('home', 'en')
  return buildMetadata(found?.doc ?? null, '/', 'en')
}

export default async function HomePage() {
  const found = await resolveSlug('home', 'en')
  if (!found) notFound()
  return <PageRenderer resolved={found} />
}
