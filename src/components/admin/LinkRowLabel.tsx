'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Shows the link label (or title/heading) in collapsed array rows in the admin panel. */
export const LinkRowLabel = () => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const text = (data?.label || data?.title || data?.heading || data?.value || data?.question || data?.text) as
    | string
    | undefined
  return <span>{text ? String(text).split('\n')[0] : `Item ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
}
