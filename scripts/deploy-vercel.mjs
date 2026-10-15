/**
 * One-time deploy of EnviroMET CMS to Vercel + Supabase (Postgres).
 * Run it with deploy-vercel.bat (Windows) or: node scripts/deploy-vercel.mjs
 *
 * What it does, in order:
 *   1. Asks once for the Supabase connection string and keeps it in deploy.env (never committed or uploaded).
 *   2. Checks the database connection.
 *   3. Signs in to Vercel (opens the browser the first time) and links/creates the "enviromet-cms" project.
 *   4. Creates a Vercel Blob store for images (first run only) and reads its token.
 *   5. Saves DATABASE_URI, PAYLOAD_SECRET, PREVIEW_SECRET and CRON_SECRET in the Vercel project.
 *   6. Imports all content into the empty database (skipped when the database already has pages).
 *   7. Deploys to production and writes the link + admin login to deploy-result.txt.
 *
 * Re-running is safe: finished steps are skipped and content is never re-imported over existing data
 * (pass --reseed to wipe and re-import on purpose).
 */
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const ENV_FILE = path.join(root, 'deploy.env')
const RESULT_FILE = path.join(root, 'deploy-result.txt')
const PROJECT = 'enviromet-cms'
const RESEED = process.argv.includes('--reseed')
const isWin = process.platform === 'win32'

const say = (msg = '') => console.log(msg)
const step = (n, msg) => say(`\n[${n}/7] ${msg}`)
const fail = (msg) => {
  say(`\nSTOPPED: ${msg}`)
  process.exit(1)
}

// The Vercel CLI is installed into .deploy-tools by deploy-vercel.bat and started with node directly
// (no shell), so passwords with special characters are passed safely.
const VC = path.join(root, '.deploy-tools', 'node_modules', 'vercel', 'dist', 'vc.js')
if (!fs.existsSync(VC)) {
  console.log('Installing the Vercel CLI…')
  const r = spawnSync(isWin ? 'npm.cmd' : 'npm', ['install', 'vercel@64.0.2', '--prefix', '.deploy-tools', '--no-audit', '--no-fund'], {
    stdio: 'inherit',
    shell: isWin,
  })
  if (r.status !== 0 || !fs.existsSync(VC)) {
    console.log('Could not install the Vercel CLI.')
    process.exit(1)
  }
}
const vercel = (args, opts = {}) =>
  spawnSync(process.execPath, [VC, ...args], {
    encoding: 'utf8',
    stdio: opts.inherit ? 'inherit' : ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...(opts.env || {}) },
  })

const readEnvFile = (file) => {
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')]
      }),
  )
}

const writeEnvFile = (vars) => {
  const body = [
    '# EnviroMET production settings — created by deploy-vercel.bat. Keep this file private.',
    ...Object.entries(vars).map(([k, v]) => `${k}=${v}`),
    '',
  ].join('\n')
  fs.writeFileSync(ENV_FILE, body)
}

const secret = (bytes = 32) => randomBytes(bytes).toString('base64url')
const adminPassword = () => {
  // 16 characters, letters + digits + one symbol, no look-alike characters
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const b = randomBytes(15)
  return Array.from(b, (x) => chars[x % chars.length]).join('') + '!'
}

/* ------------------------------------------------------------------ */

say('EnviroMET CMS — deploy to Vercel + Supabase')
say('============================================')

// 1 + 2. Settings and database --------------------------------------------
const env = readEnvFile(ENV_FILE)

/** Reads a line without showing what is typed (for the database password). */
const askHidden = (question) =>
  new Promise((resolve) => {
    process.stdout.write(question)
    const stdin = process.stdin
    let value = ''
    const onData = (buf) => {
      for (const ch of buf.toString('utf8')) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode?.(false)
          stdin.pause()
          stdin.off('data', onData)
          process.stdout.write('\n')
          return resolve(value)
        }
        if (ch === '\u0003') process.exit(1) // Ctrl+C
        if (ch === '\u0008' || ch === '\u007f') value = value.slice(0, -1)
        else value += ch
      }
    }
    stdin.setRawMode?.(true)
    stdin.resume()
    stdin.on('data', onData)
  })

/**
 * Builds the connection string from what Supabase shows (with [YOUR-PASSWORD] or any password in it)
 * and the real password typed separately, percent-encoding the password (@ → %40 and so on).
 */
const buildUri = (template, password) => {
  const m = template.trim().match(/^(postgres(?:ql)?:\/\/)([^:/@]+)(?::.*)?@([^@]+)$/)
  if (!m) return null
  const [, scheme, user, rest] = m
  return `${scheme}${user}:${encodeURIComponent(password)}@${rest}`
}

const tryConnect = async (uri) => {
  const client = new pg.Client({ connectionString: uri, connectionTimeoutMillis: 15000 })
  try {
    await client.connect()
    const r = await client.query(`select to_regclass('public.pages') as t`)
    const has = r.rows[0].t ? Number((await client.query('select count(*) from pages')).rows[0].count) > 0 : false
    return { ok: true, hasContent: has }
  } catch (e) {
    return { ok: false, error: e.message }
  } finally {
    await client.end().catch(() => {})
  }
}

step(1, 'Database (Supabase)')
let hasContent = false
let check = env.DATABASE_URI ? await tryConnect(env.DATABASE_URI) : { ok: false }
if (env.DATABASE_URI && !check.ok) say(`The saved connection did not work (${check.error}).`)
while (!check.ok) {
  say('Copy the connection string from Supabase → your project → Connect → Direct →')
  say('"Transaction pooler" (port 6543) and paste it as it is — [YOUR-PASSWORD] can stay in it.')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const template = (await rl.question('\nConnection string: ')).trim()
  rl.close()
  const password = await askHidden('Database password (hidden while you type): ')
  const uri = buildUri(template, password)
  if (!uri) {
    say('That does not look like a Supabase connection string (it should start with postgresql://). Try again.\n')
    continue
  }
  say('Connecting…')
  check = await tryConnect(uri)
  if (check.ok) env.DATABASE_URI = uri
  else say(`Could not connect: ${check.error}\nCheck the password (or reset it in Supabase → Connect → Reset database password) and try again.\n`)
}
hasContent = check.hasContent
say(hasContent ? 'Connected. The database already has content.' : 'Connected. The database is empty.')

step(2, 'Production settings')
env.PAYLOAD_SECRET ||= secret()
env.PREVIEW_SECRET ||= secret(24)
env.CRON_SECRET ||= secret(24) // lets only Vercel's daily cron call /api/keep-alive
env.ADMIN_EMAIL ||= 'admin@enviromet.local'
env.ADMIN_PASSWORD ||= adminPassword()
writeEnvFile(env)
say('Saved in deploy.env (private, never uploaded).')

// 3. Vercel login + project ------------------------------------------------
step(3, 'Signing in to Vercel')
if (vercel(['whoami']).status !== 0) {
  say('A browser window opens: sign in to Vercel there, then come back here.')
  if (vercel(['login'], { inherit: true }).status !== 0) fail('Vercel sign-in did not finish.')
}
say(`Signed in as ${vercel(['whoami']).stdout.trim().split(/\r?\n/).pop()}`)
if (!fs.existsSync(path.join(root, '.vercel', 'project.json'))) {
  say(`Creating / linking the Vercel project "${PROJECT}"…`)
  if (vercel(['link', '--yes', '--project', PROJECT], { inherit: true }).status !== 0)
    fail('Could not link the Vercel project.')
}

// 4. Blob storage for images ---------------------------------------------
step(4, 'Image storage (Vercel Blob)')
const pullEnv = () => {
  const file = path.join(root, '.vercel', '.env.production.local')
  vercel(['env', 'pull', file, '--environment=production', '--yes'])
  return readEnvFile(file)
}
let remote = pullEnv()
if (!remote.BLOB_READ_WRITE_TOKEN) {
  say('Creating a Blob store "enviromet-media" (Frankfurt) and connecting it to the project…')
  const r = vercel(['blob', 'create-store', 'enviromet-media', '--access', 'public', '--region', 'fra1', '--yes'], {
    inherit: true,
  })
  if (r.status !== 0) fail('Could not create the Blob store. Create it in Vercel → Storage → Blob, connect it to the project, and run again.')
  remote = pullEnv()
}
if (!remote.BLOB_READ_WRITE_TOKEN)
  fail('The Blob token is not in the project yet. In Vercel → Storage, connect the Blob store to "enviromet-cms" and run again.')
say('Blob storage connected.')

// 5. Environment variables on Vercel ---------------------------------------
step(5, 'Saving settings in the Vercel project')
for (const [name, value] of [
  ['DATABASE_URI', env.DATABASE_URI],
  ['PAYLOAD_SECRET', env.PAYLOAD_SECRET],
  ['PREVIEW_SECRET', env.PREVIEW_SECRET],
  ['CRON_SECRET', env.CRON_SECRET],
]) {
  if (remote[name] === value) continue
  const r = vercel(['env', 'add', name, 'production', '--value', value, '--force', '--yes'])
  if (r.status !== 0) fail(`Could not save ${name} in Vercel:\n${r.stderr || r.stdout}`)
  say(`  ${name} saved`)
}

/** Counts images listed in the database that are not in Blob storage (an earlier import that lost them). */
const missingImages = async (uri, token) => {
  const storeId = token?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase()
  if (!storeId) return 0
  const client = new pg.Client({ connectionString: uri, connectionTimeoutMillis: 15000 })
  try {
    await client.connect()
    if (!(await client.query(`select to_regclass('public.media') as t`)).rows[0].t) return 0
    const rows = (await client.query('select filename from media where filename is not null')).rows
    let missing = 0
    for (const { filename } of rows) {
      const r = await fetch(`https://${storeId}.public.blob.vercel-storage.com/${encodeURIComponent(filename)}`, {
        method: 'HEAD',
      }).catch(() => null)
      if (!r || !r.ok) missing++
    }
    return missing
  } catch {
    return 0
  } finally {
    await client.end().catch(() => {})
  }
}

// 6. Content import ---------------------------------------------------
step(6, 'Importing the website content')
let reseed = RESEED
if (hasContent && !reseed) {
  const missing = await missingImages(env.DATABASE_URI, remote.BLOB_READ_WRITE_TOKEN)
  if (missing > 0) {
    say(`${missing} images from the last import are missing in Blob storage, so the content is imported again.`)
    reseed = true
  }
}
/** Runs a TypeScript script from src/seed against the production database (tsx directly: on Windows
 *  `payload run` can exit silently). Tables are created/updated by the schema push. */
const runSeedScript = (file) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, ['--no-deprecation', '--import', 'tsx', file], {
      stdio: 'inherit',
      cwd: root,
      env: {
        ...process.env,
        DATABASE_URI: env.DATABASE_URI,
        PAYLOAD_SECRET: env.PAYLOAD_SECRET,
        BLOB_READ_WRITE_TOKEN: remote.BLOB_READ_WRITE_TOKEN,
        PAYLOAD_DB_PUSH: 'true',
        PAYLOAD_USE_BLOB: 'true',
        SEED_ADMIN_EMAIL: env.ADMIN_EMAIL,
        SEED_ADMIN_PASSWORD: env.ADMIN_PASSWORD,
      },
    })
    child.on('exit', resolve)
  })

if (hasContent && !reseed) {
  // Keep the live content; only add what newer versions of the site need (new tables,
  // shared sections, solution settings, page templates). Safe to run on every deploy.
  say('The database already has content: keeping it and applying updates…')
  if ((await runSeedScript('src/seed/upgrade.ts')) !== 0) fail('The database update failed (see the messages above).')
  say('Database up to date.')
} else {
  say('Creating the tables and importing 85 pages and all images. This takes a few minutes…')
  if ((await runSeedScript('src/seed/index.ts')) !== 0)
    fail('The content import failed (see the messages above). Fix the cause and run again.')
  const after = await tryConnect(env.DATABASE_URI)
  if (!after.ok || !after.hasContent) fail('The content import finished but the database still has no pages. See the messages above.')
  say('Content imported.')
}

// 7. Deploy -------------------------------------------------------------
step(7, 'Deploying to Vercel (the build takes 3–6 minutes)')
const dep = vercel(['deploy', '--prod', '--yes'], { inherit: false })
process.stdout.write(dep.stdout || '')
process.stderr.write(dep.stderr || '')
if (dep.status !== 0) fail('The deployment failed. The build log is on vercel.com → enviromet-cms → Deployments.')

const output = `${dep.stdout}\n${dep.stderr}`
const aliased = output.match(/Aliased:?\s+(https:\/\/\S+)/i)?.[1]
const project = JSON.parse(fs.readFileSync(path.join(root, '.vercel', 'project.json'), 'utf8'))
const url = (aliased || `https://${PROJECT}.vercel.app`).replace(/\s.*$/, '')

const result = [
  'EnviroMET CMS — production',
  '==========================',
  `Website:  ${url}`,
  `Arabic:   ${url}/ar`,
  `Admin:    ${url}/admin`,
  '',
  `Admin email:     ${env.ADMIN_EMAIL}`,
  `Admin password:  ${env.ADMIN_PASSWORD}`,
  '',
  'Change the admin email and password after the first login (Admin → Users).',
  `Vercel project id: ${project.projectId}`,
  `Deployed: ${new Date().toISOString()}`,
  '',
].join('\n')
fs.writeFileSync(RESULT_FILE, result)
say('\n' + result)
say(`Saved in ${RESULT_FILE}`)
