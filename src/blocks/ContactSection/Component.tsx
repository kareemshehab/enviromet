import React from 'react'
import { getGlobals } from '@/lib/data'
import { asLink, asLinks } from '@/lib/links'
import { CMSLink, Eyebrow, Lines } from '@/components/ui/primitives'
import { EnquiryForm } from './EnquiryForm.client'
import type { BlockData } from '../types'

export async function ContactSectionBlock({ block }: { block: BlockData<'contactSection'> }) {
  const { settings } = await getGlobals()
  const tel = settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, '')}` : null
  return (
    <section className="section">
      <div className="wrap contact-layout">
        <aside>
          {(block.evidenceTitle || !!block.evidenceLinks?.length) && (
            <div className="b2b-contact-evidence">
              {block.evidenceTitle && <strong>{block.evidenceTitle}</strong>}
              {asLinks(block.evidenceLinks).map((l, i) => (
                <CMSLink key={i} link={l} />
              ))}
            </div>
          )}
          <Eyebrow text={block.eyebrow} />
          <h2>
            <Lines text={block.heading} />
          </h2>
          <a className="contact-email" href={`mailto:${settings.email}`}>
            {settings.email} ↗
          </a>
          {tel && (
            <a className="seo-phone" href={tel}>
              Call {settings.phone} ↗
            </a>
          )}
          {block.intro && <p>{block.intro}</p>}
          {(block.briefTitle || block.briefText) && (
            <div className="seo-enquiry-check">
              {block.briefTitle && <strong>{block.briefTitle}</strong>}
              {block.briefText && <span>{block.briefText}</span>}
            </div>
          )}
          {block.showOffices &&
            (settings.offices ?? []).map((o, i) => (
              <div className="office" key={i}>
                <h3>{o.title}</h3>
                <p>
                  <Lines text={o.address} />
                </p>
              </div>
            ))}
          {settings.linkedinUrl && (
            <a className="text-link" target="_blank" rel="noopener" href={settings.linkedinUrl}>
              Follow {settings.siteName} on LinkedIn ↗
            </a>
          )}
          {!!block.processSteps?.length && (
            <section className="cro-process">
              {block.processHeading && <h2>{block.processHeading}</h2>}
              <ol>
                {block.processSteps.map((s, i) => (
                  <li key={i}>{s.text}</li>
                ))}
              </ol>
              <CMSLink link={asLink(block.processLink)} appearance="text" />
            </section>
          )}
        </aside>
        <EnquiryForm
          heading={block.formHeading}
          help={block.formHelp}
          note={block.formNote}
          services={(block.serviceOptions ?? []).map((o) => ({ label: o.label, key: o.key }))}
          stages={(block.stageOptions ?? []).map((o) => ({ label: o.label }))}
          email={settings.email}
        />
      </div>
    </section>
  )
}
