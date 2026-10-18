# EnviroMET website — Next.js + Payload CMS

The complete EnviroMET website (all **87 original pages, English + Arabic**) now runs on
**Next.js 16 + Payload CMS 3**. Every text, link, image and list is edited in the CMS, and changes
appear on the website as soon as you publish them.

- Website: http://localhost:3000 · Arabic: http://localhost:3000/ar
- CMS: http://localhost:3000/admin
  - Email `admin@enviromet.local`
  - Password `ChangeMe!2026` → **change this** under *Admin → Users* the first time you log in

---

## 1. Run it

You need **Node.js 20.18+ or 22**.

**Windows (easiest):** double-click `start-enviromet.bat`. The first run installs the packages
(a few minutes, retried automatically if the network drops). Later runs start in seconds.
Keep the black window open while you use the site.

**Any terminal:**
```bash
npm install
npm run dev
```

On the first local run, development setup creates an ignored `.env` file with random
Payload and preview secrets. If the default local database (`enviromet.db`) does not
exist, it imports the website content and generates `/media` automatically. This can
take a minute. Existing databases and configured remote databases are never seeded
automatically. Keep `.env` private; production secrets must be configured separately.
To reset all content to the original website: `npm run seed`. It keeps users.

---

## 2. Where each page lives in the CMS

| Website | CMS | How it is edited |
|---|---|---|
| Home, About, Projects, Contact | **Pages** | Purpose-built blocks (hero slider, stats, logo grids, process steps…) |
| 42 other pages: hubs, expertise, products, guides, use cases, "for …" audience pages, tools, sitemap, privacy… | **Pages** (filter by *Page type*) | **Section** blocks (see below) |
| 21 solution pages (`/wind`, `/solar`, `/air` …) | **Services** | One structured template: hero, scope, procurement table, FAQ, related projects… The services hub and expertise pages list services automatically. |
| 9 project pages (`/project-…`) | **Projects** | One record = the project card **and** its detail page. Previous/next follow *Sort order*. |
| Sections repeated on several pages ("Technical questions", "Your next step" banner…) | **Content → Shared sections** | Edit once: every page that places it updates |
| Order, visibility and common text of all 21 solution pages | **Site → Solution pages (shared)** | One place for what every solution page shares |
| Starting layouts for new pages | **Content → Page templates** | Offered when you create a page |
| Header, footer, email, phone, offices, default CTA banner | **Site → Header / Footer / Site settings** | Shared by every page |
| Contact-form enquiries (EN + AR) | **Leads → Enquiries** | New enquiries arrive here |

### Arabic (`/ar/…`)
Localization is switched on (**Locale** menu, top right of the editor). The 9 Arabic pages are the
Arabic version of the same record: e.g. *Pages → About* has an English and an Arabic layout, and
*Services → Wind* has an Arabic **Custom layout**. To translate another page, open it, switch the
locale to **العربية**, add content and publish. It then appears at `/ar/<page>`, right-to-left.

### The Section builder
Most pages are built from **Sections**. A section holds **items** that map 1:1 to the original
design:

`Heading · Text · Link / button · List · Image · Video · Table · FAQ · Card grid · Enquiry form · Group · Custom HTML`

- **Text fields** accept simple inline HTML (links, `<strong>`). Press Enter for a line break.
- **Group** wraps items in a styled box (e.g. `detail-box`, `refine-planning-proof`, a card). Groups nest up to three levels.
- **Card grid** can list *Services from the CMS* (always up to date) or manual cards, with optional filter buttons.
- The **Advanced** panel holds the original CSS classes. Leave it as it is unless you are restyling.
- **Custom HTML** is used only for 11 interactive widgets: the cost-calculator form and results,
  two print/download buttons and the guide-search box. Their behaviour comes from the original scripts,
  enabled per page under *Interactive behaviours*.

### Show, hide and reorder sections
Every section in a page (and in solutions, shared sections and templates) has:
- an **eye button** in its header: hides the section on the website without deleting it
  (the header then shows **Hidden**). Click again to show it;
- a **drag handle** and **⋯ → Move up / Move down** to change the order.

### Page templates (new pages)
*Pages* opens with a **Start a new page** panel: type a title, pick a template and click
**Create page**. The page is created as a draft with the template's sections (English and Arabic).
Three templates come from the most common page types on the site:

| Template | Modelled on | Pages of this type |
|---|---|---|
| Expertise page | Measurement expertise | 8 |
| Use case page | Use case: wind campaign | 6 |
| Equipment page | Wind LiDAR (includes the shared *Technical questions*) | 6 |

Edit them or add more in **Content → Page templates**. Changing a template never changes existing pages.

### Shared content
- **Shared sections:** 7 sections were identical on several pages (25 places in total). Each now
  exists once in **Content → Shared sections** and pages place it with the **Shared section** block.
  The editor shows where a section is used; a section still in use cannot be deleted.
  Each page can still hide or move its copy.
- **Solution pages (shared):** the 21 solution pages share one template. Reorder or hide its parts
  (intro, highlight figure, solution and sidebar, related projects, brief and FAQs, business case,
  technical basis, extra sections, closing banner) once for all solutions. Text that was identical on
  every solution (solution label, "Set the campaign up for review", the enquiry box) is set there too;
  filling the field on a solution overrides it for that solution only.

### Editing & publishing
1. Edit a page and use **Live Preview** (eye icon) to see the real page update as you type.
2. Click **Publish changes**. The public site updates immediately (in production the cached page is refreshed automatically).
3. Drafts are never public. Every save keeps a version you can restore.

---

## 3. What changed compared with the original static site

| Change | Why |
|---|---|
| Page title bars are dark blue with white text again | The original CSS made the headings almost invisible (white on pale blue). Approved fix in `src/styles/legacy/cms.css`. |
| "Field delivery" steps on Home/About show each number once | The original printed the numbers twice and squeezed the text into a 1-word column. |
| The 5 technical guides use the standard header and footer | The originals used an outdated header and a stretched logo, because they skipped `ux.css`. |
| Contact forms (EN + AR) send the enquiry to the CMS | Previously they only prepared an email draft (the draft is still offered). |
| Clean URLs (`/solar` instead of `solar.html`, `/ar/about` instead of `ar-about.html`) | Every old `.html` link redirects permanently (308) to the new URL. |
| `sitemap.xml` and `robots.txt` are generated by Next.js | They always list the current CMS pages. |

Everything else was verified automatically against the original: the visible text, the
element structure, the links, the images and every element `id` of each page, at desktop and mobile size.

---

## 4. Project structure

```
src/
├─ app/                         Routes only
│  ├─ (frontend)/               English  /  and  /[slug]
│  ├─ (arabic)/ar/              Arabic   /ar and /ar/[slug]  (lang="ar" dir="rtl")
│  └─ (payload)/                Admin panel + REST/GraphQL API (custom.scss = admin styling)
├─ payload.config.ts            CMS config: SQLite locally / Postgres in production, EN/AR, collections, globals
├─ collections/                 Pages · Services · Projects · SharedSections · PageTemplates · Media · Enquiries · Users
├─ globals/                     Header · Footer · Site settings · SolutionTemplate (+ solutionParts.ts)
├─ blocks/                      One folder per block:
│  ├─ <Block>/config.ts         CMS fields (loaded by Payload, no React)
│  ├─ <Block>/Component.tsx     Website rendering (server component)
│  ├─ <Block>/*.client.tsx      Interactive parts only (slider, filters, enquiry form)
│  ├─ index.ts                  contentBlocks / pageBlocks lists
│  ├─ sectionControls.ts        Show/hide field + section header label for every block
│  └─ RenderBlocks.tsx          Dispatcher: blockType → Component (skips hidden sections)
├─ components/
│  ├─ layout/                   SiteShell, Header (server) + HeaderNav.client, SearchDialog.client, Footer
│  ├─ templates/                PageRenderer (/<slug> → Page, Service or Project), ServiceTemplate, ProjectDetail
│  ├─ ui/                       Primitives (links, images, text), ProjectCard, Checklist, LegacyScripts.client
│  ├─ preview/                  Live Preview listener (client)
│  └─ admin/                    Admin panel components (dashboard, section labels, template chooser…)
├─ endpoints/                   POST /api/pages/from-template
├─ lib/
│  ├─ data.ts                   Server-only data access (cached per request): pages, globals, shared sections
│  └─ …                         links, routes, metadata, slug, sharedSectionUsage
├─ styles/                      Tailwind CSS v4 (see below)
├─ hooks/revalidate.ts          Refreshes cached pages (EN + AR) when content is saved
└─ seed/                        Seed script, shared-content extraction (shared.ts), import/*.json
scripts/                        import_static_site.py (original HTML → CMS data), deploy-vercel.mjs
public/                         Fonts, images and the 3 original interactive scripts
```

**Server vs client components.** Everything renders on the server by default (blocks, templates,
header data, footer). Only the parts that need the browser are client components, named
`*.client.tsx`: the header menu (open/close, active page), the search dialog (loaded only when
opened), the hero slider, the project/service filters, the enquiry form and the Live Preview
listener. Data is fetched only in server code through `src/lib/data.ts` (marked `server-only`).

**Styles (Tailwind CSS v4).** `src/styles/site.css` is the single stylesheet, compiled by Tailwind
through PostCSS and bundled by Next.js (one cached file instead of ten).
- `theme.css`: brand tokens (`--color-brand-blue`, `--color-ink`, `--color-line`…), which also give
  utilities such as `bg-brand-blue`, `text-ink`, `border-line`, and the site's breakpoints as variants
  (`below-tablet:`, `below-mobile:`…).
- `legacy/*.css` and `components/site-header.css`, `site-footer.css`: the site's component styles,
  written with the tokens and `@apply`. Class names are unchanged because CMS content uses them.
- Utility classes can be used directly in JSX; they sit in a later layer and override component styles.
- Tailwind's preflight reset is not loaded (the site keeps its own), and `source-exclusions.css`
  stops utilities whose names clash with the design's own classes (`rounded`, `filter`, `outline`).

---

## 5. Re-importing from the original HTML

The content in `src/seed/import/*.json` was generated from the original `dist` folder:

```bash
pip install beautifulsoup4
python3 scripts/import_static_site.py ../dist src/seed/import
npm run seed
```

`report.json` lists every element that became **Custom HTML** (currently 11 interactive widgets) and
any warnings.

---

## 6. Before going live

- **Media storage:** for cloud hosting, add `@payloadcms/storage-s3` (or Azure / GCS).
- **Secrets:** set long random `PAYLOAD_SECRET` and `PREVIEW_SECRET`, and set `NEXT_PUBLIC_SERVER_URL` to the real domain.
- **Enquiry alerts:** add an email adapter (e.g. `@payloadcms/email-nodemailer`) and an `afterChange`
  hook on Enquiries to notify sales. Add a captcha or rate limit to the public form.
- **SEO:** set `NEXT_PUBLIC_SERVER_URL` to the final HTTPS domain and set
  `SEARCH_ENGINE_INDEXING=true` in production at launch, then rebuild/redeploy.
  Public production deployments are indexable by default unless the value is `false`;
  `.env.example` explicitly keeps indexing off until launch. Development, localhost and
  Vercel preview deployments always stay `noindex`. Draft previews are also `noindex`.
  Titles, descriptions and social images are editable in each document's **SEO** tab;
  shared fallbacks are under **Site settings → SEO defaults**. Canonicals, existing EN/AR
  alternates, JSON-LD and the published-content sitemap are generated automatically.
  After deploying, verify `/robots.txt` and `/sitemap.xml`, then submit the sitemap in
  Google Search Console. See [SEO implementation notes](docs/seo.md) for verification.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run seed` | Re-import all content (wipes Pages, Services, Projects, Shared sections, Templates, Media) |
| `npm run migrate` | Live Postgres only (needs `DATABASE_URI`): creates a migration for schema changes and applies pending migrations (see §8). Does nothing on local SQLite |
| `npm run upgrade` | Adds shared sections, solution settings and page templates to an existing database without deleting anything (safe to repeat; the deploy script runs it on the live database) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint checks |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `npm run generate:importmap` | Regenerate the admin import map after adding admin components |

## 7. Deploy to Vercel + Supabase

1. Create a Supabase project (region **Frankfurt / eu-central-1**) and copy its connection string:
   *Connect → Transaction pooler* (port 6543), with your database password filled in.
2. Double-click **`deploy-vercel.bat`**. It asks for the connection string once, signs you in to Vercel
   in the browser, creates the `enviromet-cms` project and an image store (Vercel Blob), imports all
   content into Supabase and deploys. The link and admin login are written to `deploy-result.txt`.
3. Later deploys: run `deploy-vercel.bat` again. Content is never re-imported over existing data:
   the script applies database migrations (§8) and runs `src/seed/upgrade.ts` (adds new features such as
   shared sections and page templates, keeps every edit). `deploy-vercel.bat --reseed` wipes and
   re-imports on purpose.

How production differs from local: Postgres instead of SQLite (`DATABASE_URI`, blocks stored as JSON),
images in Vercel Blob instead of `/media` (`BLOB_READ_WRITE_TOKEN`), functions in Frankfurt (`vercel.json`).
Secrets live in `deploy.env` on your PC and in the Vercel project settings, never in the code.

## 8. Database changes: migrations (live) and push (local)

- **Local (SQLite):** schema changes are applied automatically when the server starts (`push`). Nothing to do.
- **Live (Supabase Postgres):** changes go through **migrations** in `src/migrations`, like EF Core migrations
  in .NET. Every deploy runs `src/seed/migrate.ts`, which:
  1. compares the collections in the code with the last migration snapshot (`*.json`) and, if they differ,
     writes a new migration (`<date>_schema_change.ts` + `.json`). **Commit it** (push-to-github.bat);
  2. stops the deploy if a change can delete data (drop a table or column, change a column type, rename).
     Check it, then run `deploy-vercel.bat --allow-data-loss` if it is intended;
  3. applies every migration the database has not run yet (recorded in the `payload_migrations` table).
- `20261015_123043_initial` is the starting point (the schema as it was when migrations were introduced).
  The live database already had these tables (it was built by push), so it was recorded as applied
  without running it. A new, empty database is built by running it.
- If a deploy shows a question about renamed columns, answer it in the window: it asks whether a column was
  renamed or is a new one.

