/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Database migrations for the live Postgres database (Supabase). Run by deploy-vercel before
 * the content update; `npm run migrate` does the same by hand (needs DATABASE_URI).
 *
 *  1. Schema changed in the code (collections, fields, blocks)?  → writes a new migration file
 *     to src/migrations (commit it to GitHub). Changes that can lose data (dropping a table or
 *     column, changing a column type) stop here unless ALLOW_DATA_LOSS=true.
 *  2. Database created earlier by schema push (before migrations)? → records the initial
 *     migration as already applied, so nothing is recreated.
 *  3. Applies every migration the database has not run yet.
 *
 * Local SQLite keeps using schema push; this script then does nothing.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import config from '@payload-config'

if (!process.env.DATABASE_URI?.startsWith('postgres')) {
  console.log('Local SQLite database: schema changes are applied automatically (no migrations).')
  process.exit(0)
}

const RISKY = /\bDROP\s+(TABLE|COLUMN|TYPE)\b|\bSET\s+DATA\s+TYPE\b|\bRENAME\s+(TO|COLUMN)\b/i

try {
  const payload = await getPayload({ config })
  const db = payload.db as any
  const dir: string = db.migrationDir
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const snapshots = () => fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

  /* 1. New migration for schema changes made in the code */
  const { generateDrizzleJson, generateMigration, upSnapshot } = db.requireDrizzleKit()
  const after = await generateDrizzleJson(db.schema)
  const last = snapshots().at(-1)
  let before = last ? JSON.parse(fs.readFileSync(path.join(dir, last), 'utf8')) : db.defaultDrizzleSnapshot
  if (upSnapshot && before.version < after.version) before = upSnapshot(before)
  const statements: string[] = await generateMigration(before, after)
  if (statements.length) {
    const risky = statements.filter((s) => RISKY.test(s))
    if (risky.length && process.env.ALLOW_DATA_LOSS !== 'true') {
      payload.logger.error(
        'This schema change can delete data on the live database:\n  ' +
          risky.join('\n  ') +
          '\nNothing was changed. Check the change; to apply it anyway run: deploy-vercel.bat --allow-data-loss',
      )
      process.exit(2)
    }
    await db.createMigration({ migrationName: last ? 'schema_change' : 'initial', payload, forceAcceptWarning: true })
    payload.logger.info('New migration created in src/migrations: commit it to GitHub with the rest of the code.')
  }

  /* 2. A database built by schema push before migrations existed: record the initial migration */
  const exists = async (table: string) =>
    Boolean((await db.drizzle.execute(sql`select to_regclass(${'public.' + table}) as t`)).rows?.[0]?.t)
  if ((await exists('pages')) && (await exists('payload_migrations'))) {
    const ran = (await db.drizzle.execute(sql`select name, batch from payload_migrations`)).rows as { name: string; batch: number }[]
    if (!ran.some((m) => Number(m.batch) > 0)) {
      const initial = fs.readdirSync(dir).find((f) => /_initial\.ts$/.test(f))?.replace(/\.ts$/, '')
      if (initial) {
        await db.drizzle.execute(sql`delete from payload_migrations where batch = -1`)
        await payload.create({ collection: 'payload-migrations', data: { name: initial, batch: 1 } })
        payload.logger.info(`Existing database: recorded ${initial} as applied (its tables already exist).`)
      }
    }
  }

  /* 3. Apply what has not run yet */
  await db.migrate()
  payload.logger.info('Database schema up to date.')
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
