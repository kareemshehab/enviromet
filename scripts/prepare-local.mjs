/** First-run setup for local development; never seed an existing or remote database. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import nextEnv from '@next/env'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
nextEnv.loadEnvConfig(root, true)

if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.DATABASE_URI) {
  if (!process.env.PAYLOAD_SECRET?.trim()) {
    throw new Error('Set PAYLOAD_SECRET in the configured environment before starting Payload.')
  }
} else {
  const additions = []
  const ensure = (key, value) => {
    if (process.env[key]?.trim()) return
    additions.push(`${key}=${value}`)
    process.env[key] = value
  }
  ensure('PAYLOAD_SECRET', randomBytes(32).toString('hex'))
  ensure('PREVIEW_SECRET', randomBytes(32).toString('hex'))
  ensure('DATABASE_URL', 'file:./enviromet.db')
  ensure('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3000')
  ensure('SEARCH_ENGINE_INDEXING', 'false')
  if (additions.length) {
    fs.appendFileSync(
      path.join(root, '.env'),
      `\n# Local development settings\n${additions.join('\n')}\n`,
      { mode: 0o600 },
    )
    console.log('Local environment ready. Private values are stored in the ignored .env file.')
  }

  // The seed script resets its target. Only use it when the default local DB does not exist.
  const localDatabase = path.join(root, 'enviromet.db')
  if (process.env.DATABASE_URL === 'file:./enviromet.db' && !fs.existsSync(localDatabase)) {
    console.log('Creating the local website database and media for the first time...')
    const seed = spawnSync(
      process.execPath,
      ['--no-deprecation', '--import', 'tsx', 'src/seed/index.ts'],
      {
        cwd: root,
        stdio: 'inherit',
        env: process.env,
      },
    )
    if (seed.error) throw seed.error
    if (seed.status !== 0)
      throw new Error(
        'Local content initialization failed. Check the seed output above before restarting.',
      )
  }
}
