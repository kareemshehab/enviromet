import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * The whole original site now lives in the CMS. Old *.html URLs (bookmarks, search
 * engines, external links) are permanently redirected to the new clean routes.
 */
const legacyRedirects = [
  { source: '/index.html', destination: '/' },
  { source: '/404.html', destination: '/' },
  { source: '/ar-index.html', destination: '/ar' },
  { source: '/ar-procurement.html', destination: '/ar/for-procurement' },
  // service.html?service=wind → /wind
  {
    source: '/service.html',
    has: [{ type: 'query' as const, key: 'service', value: '(?<service>[a-z0-9-]+)' }],
    destination: '/:service',
  },
  { source: '/service.html', destination: '/services' },
  { source: '/ar-:name([a-z0-9-]+).html', destination: '/ar/:name' },
  { source: '/:name([a-z0-9-]+).html', destination: '/:name' },
]

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }))
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
