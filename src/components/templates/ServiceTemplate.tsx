import React from 'react'
import type { Project, Service } from '@/payload-types'
import { asLink as lnk, asLinks as links } from '@/lib/links'
import { solutionParts, type SolutionPart } from '@/globals/solutionParts'
import { SharedSectionBlock } from '@/blocks/SharedSection/Component'
import {
  CMSLink,
  Eyebrow,
  Img,
  Lines,
  Paragraphs,
  SmartLink,
  Unit,
} from '@/components/ui/primitives'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { CtaBanner } from '@/blocks/CallToAction/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getGlobals, getSolutionTemplate } from '@/lib/data'

/**
 * Shared template for every solution page (wind, solar, air quality, …).
 * Which parts appear, and in which order, comes from the "Solution pages (shared)" global;
 * text left empty on a solution falls back to the shared text set there.
 */
export async function ServiceTemplate({ service: s }: { service: Service }) {
  const contactHref = s.enquiryKey ? `/contact?service=${s.enquiryKey}` : '/contact'
  const projects = (s.evidence?.projects ?? []).filter(
    (p): p is Project => typeof p === 'object' && p !== null,
  )
  const scope = s.scopeItems ?? []
  const [{ settings }, shared] = await Promise.all([getGlobals(), getSolutionTemplate()])
  const cta = settings.defaultCta
    ? {
        ...settings.defaultCta,
        link: { ...settings.defaultCta.link, type: 'custom', url: contactHref },
      }
    : null

  const deliverTitle = s.deliverTitle || shared.deliverTitle
  // The enquiry box falls back field by field to the shared box.
  const own = s.enquiryBox ?? {}
  const box = {
    heading: own.heading || shared.enquiryBox?.heading,
    text: own.text || shared.enquiryBox?.text,
    buttonLabel: own.buttonLabel || shared.enquiryBox?.buttonLabel,
    evidenceTitle: own.evidenceTitle || shared.enquiryBox?.evidenceTitle,
    evidenceLinks: links(
      own.evidenceLinks?.length ? own.evidenceLinks : shared.enquiryBox?.evidenceLinks,
    ),
  }
  const businessCase =
    typeof shared.businessCase === 'object'
      ? shared.businessCase?.id
      : (shared.businessCase ?? undefined)

  const parts: Record<SolutionPart, React.ReactNode> = {
    hero: (
      <>
        <section className="page-intro">
          <div className="wrap">
            <p className="breadcrumbs">
              <SmartLink href="/">Home</SmartLink>
              {' / '}
              <SmartLink href="/services">Solutions</SmartLink>
              {' / '}
              {s.title}
            </p>
            <div className="detail-hero">
              <div>
                <Eyebrow text={s.category} />
                <h1>{s.title}</h1>
                {s.lede && <p className="lede">{s.lede}</p>}
              </div>
              <Img media={s.heroImage} priority />
            </div>
          </div>
        </section>
      </>
    ),
    coverage: (
      <>
        {s.coverage?.enabled && (
          <section className="section coverage-highlight" id={`${s.slug}-coverage`}>
            <div className="wrap">
              <Eyebrow text={s.coverage.eyebrow} />
              <h2>
                <span>{s.coverage.value}</span>
                {s.coverage.unit && (
                  <small>
                    <Unit text={s.coverage.unit} />
                  </small>
                )}
              </h2>
              {s.coverage.text && <p>{s.coverage.text}</p>}
              <SmartLink className="text-link" href={contactHref}>
                Discuss your campaign ↗
              </SmartLink>
            </div>
          </section>
        )}
      </>
    ),
    subnav: (
      <>
        <div className="ux-subnav">
          <div className="wrap">
            <a href="#scope">Scope of support</a>
            <a href="#campaign-context">Standards &amp; context</a>
            <SmartLink href={contactHref}>Discuss your campaign ↗</SmartLink>
          </div>
        </div>
      </>
    ),
    solution: (
      <>
        <section className="section">
          <div className="wrap solution-layout">
            <div>
              <Eyebrow text={s.eyebrow || shared.eyebrow} />
              <h2>
                <Lines text={s.solutionHeading} />
              </h2>
              {s.solutionIntro && <p className="large-copy">{s.solutionIntro}</p>}
              {!!scope.length && (
                <>
                  <h3 id="scope">Scope of support</h3>
                  <div className="scope-grid">
                    {scope.map((item, i) => (
                      <div key={i}>
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        <h3>{item.title}</h3>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {s.standardsNote && (
                <div className="standards-strip">
                  <strong id="campaign-context">Campaign context</strong>
                  <span>{s.standardsNote}</span>
                </div>
              )}
              {deliverTitle && <h3 className="deliver-title">{deliverTitle}</h3>}
              <Paragraphs text={s.deliverText || shared.deliverText} />

              {!!s.procurement?.rows?.length && (
                <section className="b2b-spec">
                  <Eyebrow text={s.procurement.eyebrow} />
                  <h2>
                    <Lines text={s.procurement.heading} />
                  </h2>
                  <div className="b2b-table">
                    <table>
                      {s.procurement.caption && <caption>{s.procurement.caption}</caption>}
                      <thead>
                        <tr>
                          <th scope="col">Requirement</th>
                          <th scope="col">What to establish</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.procurement.rows.map((r, i) => (
                          <tr key={i}>
                            <th scope="row">{r.label}</th>
                            <td>{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <CMSLink link={lnk(s.procurement.link)} appearance="text" />
                </section>
              )}

              {(s.previousLink?.label || s.nextLink?.label) && (
                <div className="page-neighbours">
                  <CMSLink link={lnk(s.previousLink)} appearance="plain" />
                  <CMSLink link={lnk(s.nextLink)} appearance="plain" />
                </div>
              )}
            </div>

            <div>
              {!!s.relatedSolutions?.length && (
                <aside className="related-nav">
                  <h3>Related solutions</h3>
                  {links(s.relatedSolutions).map((l, i) => (
                    <CMSLink key={i} link={l} appearance="plain" />
                  ))}
                </aside>
              )}
              <aside className="detail-box">
                <h3>{box.heading || 'Discuss your requirements.'}</h3>
                {box.text && <p>{box.text}</p>}
                <SmartLink className="button" href={contactHref}>
                  {box.buttonLabel || 'Request a scoped quotation ↗'}
                </SmartLink>
                {!!box.evidenceLinks.length && (
                  <div className="b2b-proof-links">
                    {box.evidenceTitle && <strong>{box.evidenceTitle}</strong>}
                    {box.evidenceLinks.map((l, i) => (
                      <CMSLink key={i} link={l} appearance="plain" />
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </>
    ),
    evidence: (
      <>
        {!!projects.length && (
          <section className="section pale">
            <div className="wrap">
              <div className="section-heading">
                <div>
                  <Eyebrow text={s.evidence?.eyebrow} />
                  <h2>
                    <Lines text={s.evidence?.heading} />
                  </h2>
                </div>
                <SmartLink className="text-link" href="/projects">
                  All use cases ↗
                </SmartLink>
              </div>
              <div className="project-grid">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    ),
    brief: (
      <>
        {s.brief?.heading && (
          <section className="section seo-service-brief">
            <div className="wrap split">
              <div>
                <Eyebrow text={s.brief.eyebrow} />
                <h2>
                  <Lines text={s.brief.heading} />
                </h2>
                <Paragraphs text={s.brief.body} />
                {s.brief.audience && (
                  <>
                    <h3>Who this supports</h3>
                    <p>{s.brief.audience}</p>
                  </>
                )}
                {s.brief.note && <p className="small-note">{s.brief.note}</p>}
              </div>
              <div>
                {!!scope.length && (
                  <>
                    <h3>Scope items to agree</h3>
                    <ul className="check-list">
                      {scope.map((item, i) => (
                        <li key={i}>{item.title}</li>
                      ))}
                    </ul>
                  </>
                )}
                {(s.brief.faqs ?? []).map((f, i) => (
                  <details className="seo-faq" key={i}>
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
                <SmartLink className="button" href={contactHref}>
                  Discuss your campaign ↗
                </SmartLink>
                <CMSLink link={lnk(s.brief.guideLink)} appearance="text" />
              </div>
            </div>
          </section>
        )}
      </>
    ),
    // The strip is a shared section chosen in the global; until one is chosen, the original strip.
    businessCase: s.showBusinessCase ? (
      businessCase ? (
        <SharedSectionBlock block={{ blockType: 'sharedSection', section: businessCase }} />
      ) : (
        <DefaultBusinessCase />
      )
    ) : null,
    technicalBasis: (
      <>
        {s.technicalBasis?.heading && (
          <section className="section pale">
            <div className="wrap">
              <Eyebrow text={s.technicalBasis.eyebrow} />
              <h2>
                <Lines text={s.technicalBasis.heading} />
              </h2>
              <Paragraphs text={s.technicalBasis.body} />
              <CMSLink link={lnk(s.technicalBasis.link)} appearance="text" />
            </div>
          </section>
        )}
      </>
    ),
    extraSections: <RenderBlocks blocks={s.extraSections} />,
    cta: <CtaBanner data={cta} />,
  }

  // Saved order first; parts not in the saved list (e.g. added later) keep their default place at the end.
  const saved = (shared.sections ?? []).filter(
    (r): r is { part: SolutionPart; hidden?: boolean | null } => Boolean(r?.part),
  )
  const order = [
    ...saved,
    ...solutionParts
      .filter((p) => !saved.some((r) => r.part === p.value))
      .map((p) => ({ part: p.value, hidden: false })),
  ]

  return (
    <>
      {order
        .filter((r) => !r.hidden)
        .map((r) => (
          <React.Fragment key={r.part}>{parts[r.part]}</React.Fragment>
        ))}
    </>
  )
}

/** The original "Build a clearer business case" strip (used until a shared section is chosen). */
function DefaultBusinessCase() {
  return (
    <section className="section cro-next">
      <div className="wrap">
        <p className="eyebrow">BUILD A CLEARER BUSINESS CASE</p>
        <h2>
          Know the scope.
          <br />
          Compare the campaign.
        </h2>
        <p>
          Use your assumptions to compare setup, operations and field-service costs. Then align the
          technical requirements with the project team.
        </p>
        <div className="actions">
          <SmartLink className="button" href="/campaign-cost-calculator">
            Compare campaign costs ↗
          </SmartLink>
          <SmartLink className="text-link" href="/campaign-brief">
            Get the project brief ↗
          </SmartLink>
        </div>
        <div className="cro-trust">
          <SmartLink href="/projects">Documented project scopes</SmartLink>
          <SmartLink href="/quality">Quality &amp; measurement standards</SmartLink>
          <SmartLink href="/about">Explore company capabilities ↗</SmartLink>
        </div>
      </div>
    </section>
  )
}
