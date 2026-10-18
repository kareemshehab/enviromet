/** Read-only audit of a running isolated production build. No third-party packages. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const origin = process.env.SEO_TEST_ORIGIN || 'http://localhost:3100'
const canonicalOrigin = process.env.SEO_CANONICAL_ORIGIN || 'https://seo.example.org'
const shouldIndex = process.env.SEO_EXPECT_INDEX !== 'false'
const fixtures = process.env.SEO_TEST_FIXTURES === 'true'
const get = (path) =>
  fetch(new URL(path, origin), { signal: AbortSignal.timeout(120000), redirect: 'manual' })
const attrs = (tag) =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]))
const meta = (html, name, key = 'name') =>
  [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attrs(m[0])).find((m) => m[key] === name)?.content

const robots = await (await get('/robots.txt')).text()
assert.match(robots, shouldIndex ? /Allow: \/\s/ : /Disallow: \/\s/)
if (shouldIndex) {
  assert.match(robots, /Disallow: \/admin/)
  assert.match(robots, /Disallow: \/api/)
  assert.ok(robots.includes(`${canonicalOrigin}/sitemap.xml`))
}

const sitemapResponse = await get('/sitemap.xml')
assert.equal(sitemapResponse.status, 200)
const sitemap = await sitemapResponse.text()
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
  const url = m[1].match(/<loc>(.*?)<\/loc>/)?.[1]
  const alternates = [...m[1].matchAll(/<xhtml:link\b[^>]*>/g)].map((a) => attrs(a[0]))
  assert.match(m[1], /<lastmod>[^<]+<\/lastmod>/)
  return { url, alternates }
})
assert.ok(entries.length > 1)
assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length)
const urls = new Set(entries.map((entry) => entry.url))
for (const { url, alternates } of entries) {
  assert.ok(url.startsWith(`${canonicalOrigin}/`))
  for (const alternate of alternates) {
    assert.ok(
      urls.has(alternate.href),
      `Sitemap alternate missing from public routes: ${alternate.href}`,
    )
  }
}
if (fixtures) {
  assert.ok(urls.has(`${canonicalOrigin}/seo-test-en-only`))
  assert.ok(!urls.has(`${canonicalOrigin}/ar/seo-test-en-only`))
  assert.ok(![...urls].some((url) => url.includes('seo-test-draft')))
}

const warnings = []
const descriptions = new Map()
const useCaseDescriptions = new Set()
let checked = 0
// A small worker pool exercises every public route without overloading SQLite.
const queue = [...entries]
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const { url, alternates } = queue.shift()
      const response = await get(new URL(url).pathname)
      assert.equal(response.status, 200, url)
      const html = await response.text()
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]))
      // Next.js serializes the root canonical without a slash; URL normalizes both forms.
      assert.equal(
        new URL(links.find((link) => link.rel === 'canonical')?.href).href,
        url,
        `Canonical: ${url}`,
      )
      for (const alternate of alternates) {
        assert.equal(
          new URL(
            links.find((link) => link.rel === 'alternate' && link.hrefLang === alternate.hreflang)
              ?.href ??
              links.find((link) => link.rel === 'alternate' && link.hreflang === alternate.hreflang)
                ?.href,
          ).href,
          alternate.href,
          `Language alternate: ${url}`,
        )
      }
      assert.match(html, /<title>[^<]+<\/title>/)
      const description = meta(html, 'description')
      assert.ok(description?.trim(), `Description: ${url}`)
      if (/\/use-case-/.test(new URL(url).pathname)) {
        assert.ok(
          !/An anonymous application|تطبيق لخدمات EnviroMET دون ذكر هوية العميل/.test(description),
        )
        assert.ok(!useCaseDescriptions.has(description), `Duplicate use-case description: ${url}`)
        useCaseDescriptions.add(description)
      }
      const duplicates = descriptions.get(description) || []
      descriptions.set(description, [...duplicates, new URL(url).pathname])
      assert.match(meta(html, 'robots'), shouldIndex ? /^index, follow$/ : /^noindex, follow$/)
      assert.equal(new URL(meta(html, 'og:url', 'property')).href, url)
      assert.ok(meta(html, 'og:image', 'property'))
      assert.match(
        html,
        new URL(url).pathname.startsWith('/ar')
          ? /<html[^>]*lang="ar"[^>]*dir="rtl"/
          : /<html[^>]*lang="en"/,
      )
      const headingCount = [...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length
      if (headingCount !== 1)
        warnings.push({ path: new URL(url).pathname, issue: `h1 count ${headingCount}` })
      const graphs = [
        ...html.matchAll(
          /<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g,
        ),
      ].flatMap((m) => JSON.parse(m[1])['@graph'])
      for (const type of ['Organization', 'WebSite', 'WebPage']) {
        assert.ok(
          graphs.some((node) => node['@type'] === type),
          `Missing ${type}: ${url}`,
        )
      }
      const webpage = graphs.find((node) => node['@type'] === 'WebPage')
      assert.equal(webpage.url, url)
      if (/\/use-case-/.test(new URL(url).pathname)) assert.equal(webpage.description, description)
      if (!['/', '/ar'].includes(new URL(url).pathname))
        assert.ok(graphs.some((node) => node['@type'] === 'BreadcrumbList'))
      checked++
    }
  }),
)
for (const path of [
  '/this-page-does-not-exist-seo',
  ...(fixtures ? ['/ar/seo-test-en-only', '/seo-test-draft'] : []),
]) {
  const response = await get(path)
  assert.equal(response.status, 404, path)
}
if (fixtures) {
  // The bypass value is server-side build data, used only against this isolated local build.
  const { preview } = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'))
  const response = await fetch(new URL('/seo-test-draft', origin), {
    headers: { cookie: `__prerender_bypass=${preview.previewModeId}` },
  })
  assert.equal(response.status, 200)
  assert.match(meta(await response.text(), 'robots'), /^noindex, follow$/)
}
for (const path of ['/admin/login', '/api/pages?limit=1']) {
  const response = await get(path)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
}
const legacy = await get('/about.html')
assert.equal(legacy.status, 308)
assert.ok(legacy.headers.get('location')?.endsWith('/about'))
console.log(
  JSON.stringify(
    {
      checked,
      indexable: shouldIndex,
      warnings,
      duplicateDescriptions: [...descriptions.values()].filter((paths) => paths.length > 1),
    },
    null,
    2,
  ),
)
