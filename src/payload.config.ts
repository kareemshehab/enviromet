import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Services } from './collections/Services'
import { Projects } from './collections/Projects'
import { Enquiries } from './collections/Enquiries'
import { PageTemplates } from './collections/PageTemplates'
import { SharedSections } from './collections/SharedSections'
import { Footer, Header, SiteSettings } from './globals'
import { SolutionTemplate } from './globals/SolutionTemplate'
import { serverURL } from './lib/serverUrl'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — EnviroMET CMS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/assets/favicon.svg' }],
    },
    // Local initials avatar (Gravatar images are blocked on offline / intranet machines).
    avatar: 'default',
    // EnviroMET branding for the admin panel. Styles: src/app/(payload)/custom.scss
    components: {
      graphics: {
        Logo: '@/components/admin/Graphics#Logo',
        Icon: '@/components/admin/Graphics#Icon',
      },
      beforeLogin: ['@/components/admin/Graphics#BeforeLogin'],
      beforeDashboard: ['@/components/admin/dashboard/Welcome#Welcome'],
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Pages, Services, Projects, SharedSections, PageTemplates, Media, Enquiries, Users],
  globals: [Header, Footer, SiteSettings, SolutionTemplate],
  editor: lexicalEditor(),
  // English + Arabic. Arabic pages are served at /ar/… with right-to-left layout.
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: false,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  /*
   * Database:
   * - Local (default): SQLite file enviromet.db. Schema changes are applied automatically (push).
   * - Production (Vercel): Postgres when DATABASE_URI is a postgres:// URL (Supabase).
   *   Schema changes go through migrations in src/migrations, created and applied by
   *   src/seed/migrate.ts when deploy-vercel runs. Never pushed.
   */
  db: process.env.DATABASE_URI?.startsWith('postgres')
    ? postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URI, max: 5 },
        push: false,
        migrationDir: path.resolve(dirname, 'migrations'),
        // Page layouts are deeply nested blocks; as JSON they are one column instead of ~500 tables.
        blocksAsJSON: true,
      })
    : sqliteAdapter({
        client: { url: process.env.DATABASE_URL || 'file:./enviromet.db' },
        // WAL lets pages read while the admin writes; busyTimeout waits instead of failing
        // when several Next.js workers open the database at the same time.
        wal: true,
        busyTimeout: 10000,
        // Development convenience: schema changes are applied automatically.
        push: true,
      }),
  sharp,
  plugins: [
    // Images and videos go to Vercel Blob on Vercel (production);
    // locally they stay in the /media folder.
    vercelBlobStorage({
      // Only on Vercel (or the deploy script's content import). The Vercel CLI also writes the token
      // into .env.local, and the local site must keep using the /media folder.
      enabled:
        Boolean(process.env.BLOB_READ_WRITE_TOKEN) &&
        (process.env.VERCEL === '1' || process.env.PAYLOAD_USE_BLOB === 'true'),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      // Upload straight from the browser: Vercel functions only accept 4.5 MB request bodies.
      clientUploads: true,
      alwaysInsertFields: true,
    }),
  ],
})
