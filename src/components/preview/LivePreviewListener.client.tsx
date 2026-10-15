'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { serverURL } from '@/lib/serverUrl'

/**
 * Rendered only in draft mode (inside the admin's Live Preview iframe).
 * Each autosave in the editor triggers a server re-render, so editors see
 * their changes on the real page as they type.
 */
export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={serverURL}
    />
  )
}
