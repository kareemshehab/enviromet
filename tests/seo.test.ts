import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { canIndexSite, languageAlternates, pagePath, serializeJsonLd } from '../src/lib/seo'
import {
  legacyUseCaseDescriptions,
  resolvePageDescription,
  useCaseDescriptions,
} from '../src/lib/useCaseSEO'

test('production can be indexed, but staging, localhost and an explicit hold cannot', () => {
  const production = { NODE_ENV: 'production' } as NodeJS.ProcessEnv
  assert.equal(canIndexSite(production, 'https://enviromet.example'), true)
  assert.equal(
    canIndexSite({ ...production, SEARCH_ENGINE_INDEXING: 'false' }, 'https://enviromet.example'),
    false,
  )
  assert.equal(
    canIndexSite(
      { ...production, VERCEL_ENV: 'preview', SEARCH_ENGINE_INDEXING: 'true' },
      'https://preview.example',
    ),
    false,
  )
  assert.equal(canIndexSite({ NODE_ENV: 'development' }, 'https://enviromet.example'), false)
  for (const url of [
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://[::1]:3000',
    'http://cms.localhost',
  ]) {
    assert.equal(canIndexSite(production, url), false)
  }
})

test('language alternates advertise only real counterparts, including localized homepages', () => {
  const en = [
    { slug: 'home', updatedAt: '' },
    { slug: 'wind', updatedAt: '' },
    { slug: 'solar', updatedAt: '' },
  ]
  const ar = [
    { slug: 'home', updatedAt: '' },
    { slug: 'wind', updatedAt: '' },
  ]
  assert.deepEqual(languageAlternates('home', en, ar), { en: '/', ar: '/ar', 'x-default': '/' })
  assert.deepEqual(languageAlternates('wind', en, ar), {
    en: '/wind',
    ar: '/ar/wind',
    'x-default': '/wind',
  })
  assert.deepEqual(languageAlternates('solar', en, ar), { en: '/solar', 'x-default': '/solar' })
  assert.deepEqual(languageAlternates('missing', en, ar), {})
  assert.equal(pagePath('home', 'ar'), '/ar')
})

test('CMS text cannot break out of JSON-LD scripts and still round-trips correctly', () => {
  const value = {
    name: '</script><script>alert("x")</script>',
    description: 'البيئة & measurement',
  }
  const serialized = serializeJsonLd(value)
  assert.equal(serialized.includes('<'), false)
  assert.deepEqual(JSON.parse(serialized), value)
})

test('all six use cases have unique, localized descriptions in both the seed and translation dictionary', () => {
  const pages = JSON.parse(
    readFileSync(new URL('../src/seed/import/pages.json', import.meta.url), 'utf8'),
  )
  const translations = JSON.parse(
    readFileSync(new URL('../src/seed/translations/ar.json', import.meta.url), 'utf8'),
  )
  assert.equal(Object.keys(useCaseDescriptions).length, 6)
  for (const locale of ['en', 'ar'] as const) {
    const descriptions = Object.values(useCaseDescriptions).map((entry) => entry[locale])
    assert.equal(new Set(descriptions).size, 6)
    for (const description of descriptions) {
      assert.ok(description.length >= 80 && description.length <= 170)
      assert.ok(!legacyUseCaseDescriptions.has(description))
    }
  }
  for (const [slug, descriptions] of Object.entries(useCaseDescriptions)) {
    assert.equal(
      pages.find((page: { slug: string }) => page.slug === slug)?.meta.description,
      descriptions.en,
    )
    assert.equal(translations[descriptions.en], descriptions.ar)
  }
})

test('existing placeholders get corrected without replacing custom or unrelated CMS copy', () => {
  for (const legacy of legacyUseCaseDescriptions) {
    for (const locale of ['en', 'ar'] as const) {
      assert.equal(
        resolvePageDescription('use-case-wind-campaign', locale, legacy),
        useCaseDescriptions['use-case-wind-campaign'][locale],
      )
    }
    assert.equal(resolvePageDescription('another-page', 'en', legacy), legacy)
  }
  assert.equal(
    resolvePageDescription('use-case-wind-campaign', 'en', 'An editor wrote this summary.'),
    'An editor wrote this summary.',
  )
  assert.equal(resolvePageDescription('use-case-wind-campaign', 'ar', null), undefined)
})
