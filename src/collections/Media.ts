import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/access'
import { revalidateEverything } from '@/hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    // Responsive renditions (WebP) — rendered as srcset on the website.
    imageSizes: [
      { name: 'small', width: 480, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'medium', width: 800, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1280, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'xlarge', width: 1920, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
    adminThumbnail: 'small',
  },
}
