import type { Page } from '@/payload-types'

/** One block of a page layout, narrowed by its blockType. */
export type LayoutBlock = NonNullable<Page['layout']>[number]
export type BlockData<T extends LayoutBlock['blockType']> = Extract<LayoutBlock, { blockType: T }>
