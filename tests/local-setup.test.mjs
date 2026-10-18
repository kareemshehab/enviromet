import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import dotenv from 'dotenv'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function fixture(run) {
  const root = fs.mkdtempSync(path.join(project, '.local-setup-test-'))
  assert.ok(root.startsWith(path.join(project, '.local-setup-test-')))
  fs.mkdirSync(path.join(root, 'scripts'))
  fs.mkdirSync(path.join(root, 'src/seed'), { recursive: true })
  fs.copyFileSync(
    path.join(project, 'scripts/prepare-local.mjs'),
    path.join(root, 'scripts/prepare-local.mjs'),
  )
  fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')
  fs.writeFileSync(
    path.join(root, 'src/seed/index.ts'),
    "import fs from 'node:fs'; fs.writeFileSync('enviromet.db', 'seeded once');",
  )
  const env = { ...process.env }
  for (const key of [
    'PAYLOAD_SECRET',
    'PREVIEW_SECRET',
    'DATABASE_URI',
    'DATABASE_URL',
    'NEXT_PUBLIC_SERVER_URL',
    'SEARCH_ENGINE_INDEXING',
    'VERCEL',
    '__NEXT_PROCESSED_ENV',
  ])
    delete env[key]
  env.NODE_ENV = 'development'
  const prepare = (overrides = {}) =>
    spawnSync(process.execPath, ['scripts/prepare-local.mjs'], {
      cwd: root,
      env: { ...env, ...overrides },
      encoding: 'utf8',
    })
  try {
    run({ root, prepare })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

test('first local run generates private persistent secrets and seeds only once', () =>
  fixture(({ root, prepare }) => {
    const initial = prepare()
    assert.equal(initial.status, 0, initial.stderr)
    const file = path.join(root, '.env')
    const contents = fs.readFileSync(file, 'utf8')
    const values = dotenv.parse(contents)
    assert.match(values.PAYLOAD_SECRET, /^[a-f0-9]{64}$/)
    assert.match(values.PREVIEW_SECRET, /^[a-f0-9]{64}$/)
    assert.notEqual(values.PAYLOAD_SECRET, values.PREVIEW_SECRET)
    fs.writeFileSync(path.join(root, 'enviromet.db'), 'editor content')
    assert.equal(prepare().status, 0)
    assert.equal(fs.readFileSync(file, 'utf8'), contents)
    assert.equal(fs.readFileSync(path.join(root, 'enviromet.db'), 'utf8'), 'editor content')
  }))

test('existing environment secrets and databases are preserved', () =>
  fixture(({ root, prepare }) => {
    fs.writeFileSync(
      path.join(root, '.env'),
      'PAYLOAD_SECRET=existing-secret\nPREVIEW_SECRET=existing-preview\n',
    )
    fs.writeFileSync(path.join(root, 'enviromet.db'), 'existing database')
    const result = prepare()
    assert.equal(result.status, 0, result.stderr)
    const values = dotenv.parse(fs.readFileSync(path.join(root, '.env')))
    assert.equal(values.PAYLOAD_SECRET, 'existing-secret')
    assert.equal(values.PREVIEW_SECRET, 'existing-preview')
    assert.equal(fs.readFileSync(path.join(root, 'enviromet.db'), 'utf8'), 'existing database')
  }))

test('configured remote and production environments never get local setup or seeding', () =>
  fixture(({ root, prepare }) => {
    assert.equal(
      prepare({
        DATABASE_URI: 'postgresql://not-contacted.example/db',
        PAYLOAD_SECRET: 'configured-secret',
      }).status,
      0,
    )
    const missingSecret = prepare({ NODE_ENV: 'production' })
    assert.notEqual(missingSecret.status, 0)
    assert.match(missingSecret.stderr, /Set PAYLOAD_SECRET/)
    assert.equal(fs.existsSync(path.join(root, '.env')), false)
    assert.equal(fs.existsSync(path.join(root, 'enviromet.db')), false)
  }))
