import React from 'react'
import { getSharedSection } from '@/lib/data'
import { RenderBlocks } from '../RenderBlocks'
import type { BlockData } from '../types'

/** Renders the referenced shared section in the page's language (nothing when it has no content there). */
export async function SharedSectionBlock({ block }: { block: BlockData<'sharedSection'> }) {
  const id = typeof block.section === 'object' ? block.section?.id : block.section
  if (!id) return null
  const shared = await getSharedSection(id)
  return <RenderBlocks blocks={shared?.layout} />
}
