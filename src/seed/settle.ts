/**
 * Starts Payload once and exits: lets the schema push (local SQLite) finish its work.
 * Used by upgrade.ts. After new collections are added, drizzle sometimes needs a second
 * pass on SQLite (it rebuilds the relations table and the first rebuild stops half-way).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

try {
  await getPayload({ config })
  process.exit(0)
} catch {
  process.exit(1)
}
