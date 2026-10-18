# SEO implementation and verification

The frontend previously emitted `noindex` in both locale layouts and blocked all
crawling in `robots.txt`. The implementation now makes public production sites
indexable, with an explicit pre-launch hold and environment protection.

## Launch configuration

Set `NEXT_PUBLIC_SERVER_URL` to the final HTTPS origin. URLs are normalized to an
HTTP(S) origin; canonical, sitemap, Open Graph and JSON-LD use the same origin.
Set `SEARCH_ENGINE_INDEXING=false` to keep a production site out of the index
before launch. At launch set it to `true` and rebuild/redeploy.

The public production default is indexable when this variable is absent.
`.env.example` deliberately sets it to `false`. Vercel previews, development,
localhost and draft previews remain `noindex`. Vercel production is detected by
`VERCEL_ENV=production`; other hosts use `NODE_ENV=production`.
Changing environment variables on a running static build is insufficient: rebuild.

Robots disallows `/admin` and `/api` in production. These routes additionally
receive `X-Robots-Tag: noindex, nofollow`. This does not replace authentication.

## Changes

- Preserve CMS SEO titles/descriptions and default fallbacks; enrich Open Graph
  image metadata with alt text and dimensions where available.
- Emit self-referencing canonicals and reciprocal `en` / `ar` alternates for
  published routes with actual localized content. Use English as `x-default`
  only when it exists. Localized homepages are handled explicitly.
- Generate sitemap entries from the same public route inventory, including
  `lastModified` and language alternatives. Read all result pages instead of
  truncating at 500 documents. Database failures now surface instead of returning
  a misleading empty list. Projects have no draft workflow and are public as
  configured in their collection.
- Read project detail pages by slug rather than only searching the first 200
  projects, to keep their URLs resolvable as the collection grows.
- Refresh the sitemap on changes/deletes, plus a one-hour fallback revalidation.
- Add Organization/WebSite JSON-LD from Site Settings and WebPage/BreadcrumbList
  for rendered pages. Escape `<` in serialized JSON to prevent CMS values from
  closing the script element. No fabricated ratings, addresses or search action.
- Keep existing English/Arabic HTML language, RTL, responsive image rendering,
  page title structure and permanent legacy URL redirects.
- Give all six use-case pages distinct English and Arabic descriptions in the
  seed content and translation dictionary. The frontend replaces only the two
  known legacy placeholder strings, so existing CMS records get the same fix
  immediately when this code is deployed. Custom editorial copy takes priority.
- The existing `npm run upgrade` / `deploy-vercel.bat` workflow additionally
  persists corrected descriptions in published records when no pending draft
  exists. It skips unpublished records and pending drafts, preserves the other
  SEO fields, and can safely run repeatedly. Guidance in the CMS description
  field now asks editors to write a unique summary per page and language.
- Vercel production builds also run the same targeted update through
  `scripts/publish-seo.ts`, using the existing protected production credentials.
  It verifies the result before the website build continues. Local and preview
  builds skip this step; it does not create tables, reseed content or touch users.

No CMS schema migration or account-plan change is required. The only content
rewrite is the six use-case descriptions in each language. The Arabic report is
`docs/enviromet-investigation-ar.html` and is also delivered on the Desktop.

## Verification completed on 18 October 2026

All checks below passed against the installed lockfile dependencies:

- `npm run typecheck`
- `npm run lint`
- `npm run test:seo` — 5 tests covering production/preview/local environment
  policy, missing translations, JSON-LD injection safety, unique bilingual
  descriptions, seed/dictionary consistency and preservation of custom copy.
- `node --import tsx tests/seo-upgrade.ts` — verified persistence in both locales,
  idempotency, preservation of other SEO fields/layouts and custom descriptions,
  and that pending drafts and unpublished pages remain untouched.
- `npm run build` — production build completed, including 161 generated routes.
- `node tests/seo-http.mjs` with `SEO_TEST_FIXTURES=true` — checked 153 public
  URLs: 152 pages from seeded project content plus one English-only test page.
  Verified HTTP 200, canonicals, reciprocal language links, sitemap modification
  dates, descriptions, Open Graph, HTML language, JSON-LD and one H1 per page.
  Final audit returned no duplicate descriptions, including all twelve use-case
  descriptions; use-case JSON-LD descriptions match the page metadata.
- Missing pages, missing Arabic translation and unpublished draft return 404;
  the draft opens with `noindex` when the local Next.js draft-mode cookie is set.
- `/about.html` redirects permanently (308); admin and API receive the robots
  header. The HTML report was rendered at desktop/mobile sizes with no page-wide
  horizontal overflow.

These checks used a separate `seo-verification.db`, a reserved example domain
`https://seo.example.org`, no production credentials and no external deployment.
Production CMS content, real performance, Search Console and field Core Web
Vitals were not measured. Preview environment gating is covered by unit tests;
draft-mode behavior was also verified over HTTP.

The initial audit found identical descriptions on six use-case pages in each language:
`use-case-environmental-campaign`, `use-case-remote-network`,
`use-case-solar-campaign`, `use-case-technical-review`,
`use-case-water-assessment`, `use-case-wind-campaign`. All twelve descriptions are
now distinct. The compatibility resolver fixes the visible metadata even when
the CMS still stores the old placeholder. Database persistence occurs when the
upgrade workflow is run against the intended database or a production build runs
on Vercel. A Git push alone does not publish when Vercel is not linked to GitHub.

## Reproducing the isolated HTTP check

The fixture script refuses every database except the explicit SQLite test URL.
The existing seed script wipes its selected database: never use a production
connection for this procedure. In a dedicated PowerShell terminal:

```powershell
$env:DATABASE_URI = ''
$env:DATABASE_URL = 'file:./seo-verification.db'
$env:PAYLOAD_SECRET = 'local-seo-verification-only-not-a-production-secret'
$env:SEED_ADMIN_PASSWORD = [guid]::NewGuid().ToString('N')
$env:NEXT_PUBLIC_SERVER_URL = 'https://seo.example.org'
$env:SEARCH_ENGINE_INDEXING = 'true'
$env:NEXT_TELEMETRY_DISABLED = '1'
npm run seed
node --import tsx tests/seo-fixtures.ts
node --import tsx tests/seo-upgrade.ts
npm run build
npm run start -- --port 3100 --hostname 127.0.0.1
```

In a second terminal, run:

```powershell
$env:SEO_TEST_FIXTURES = 'true'
node tests/seo-http.mjs
```

Stop the server when finished. Rebuild with the real database and domain before
using `npm start` or deploying; the verification build contains artificial fixtures.

## Follow-up after deployment

Verify the final-domain robots file, sitemap, 404 status, canonical host redirects
and representative EN/AR page source. Validate structured data with Google's
tools. Submit the sitemap in Search Console. Review distinct descriptions and
translation quality in Payload, then use real performance data to prioritize
further optimization.

References: [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata),
[Next.js sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap),
[Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions).
