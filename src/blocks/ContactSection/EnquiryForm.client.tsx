'use client'
import React, { useMemo, useRef, useState, useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/** label = what the visitor sees; value = what is stored (Arabic options store the English service name). */
type Option = { label: string; value?: string | null; key?: string | null }
type Step = 'scope' | 'contact' | 'review'

const T = {
  en: {
    roles: [
      ['developers', 'Developers & owners'],
      ['engineers', 'Engineers & consultants'],
      ['procurement', 'Procurement teams'],
      ['investors', 'Investors & lenders'],
      ['operators', 'Operators & asset teams'],
    ],
    location: 'Site location (optional)',
    locationPh: 'City, country or site coordinates',
    stage: 'Project stage (optional)',
    stagePh: 'Select a stage',
    service: 'Service of interest',
    servicePh: 'Select a service',
    req: 'Measurement or assessment requirements',
    reqPh: 'Objectives, instruments, heights, timing and site constraints',
    timing: 'Target start date (optional)',
    role: 'Your role (optional)',
    rolePh: 'Select your role',
    name: 'Full name',
    email: 'Work email',
    company: 'Organisation (optional)',
    consent: 'I agree to be contacted about this project enquiry.',
    privacy: 'Privacy & enquiries',
    privacyHref: '/privacy',
    steps: ['Step 1 of 3 · Project scope', 'Step 2 of 3 · Contact details', 'Step 3 of 3 · Review and send'],
    back: ['Back to scope', 'Edit contact details'],
    next: 'Continue to contact details ↗',
    send: 'Send enquiry ↗',
    sending: 'Sending…',
    recap: (s: string, l: string, st: string) => `Your scope: ${s} · ${l || 'Site to confirm'} · ${st || 'Stage to confirm'}`,
    saved: 'Thank you — your enquiry has been received by our team. A copy is ready below if you would also like to email it.',
    failed: 'We could not save your enquiry online. Please open your email app below to send it.',
    copied: (e: string) => `Enquiry copied. Paste it into an email to ${e}.`,
    copyFail: 'Select and copy the draft in the text box.',
    preview: 'Your enquiry',
    previewAria: 'Prepared enquiry text',
    copy: 'Copy enquiry',
    open: 'Open email app ↗',
    subject: 'Project enquiry — ',
    draft: (d: Record<string, string>) =>
      `EnviroMET project enquiry\n\nName: ${d.name}\nEmail: ${d.email}\nOrganisation: ${d.company || 'Not specified'}\n` +
      `Site / country: ${d.location || 'Not specified'}\nProject stage: ${d.stage || 'Not specified'}\n` +
      `Project role: ${d.role || 'Not specified'}\nService: ${d.service}\nTarget start date: ${d.timing || 'Not specified'}\n\n` +
      `Requirements:\n${d.requirements}\n\nConsent: permission to contact about this enquiry.` +
      (d.source ? `\nReference: ${d.source}` : ''),
  },
  ar: {
    roles: [
      ['developers', 'المطورون وملاك المشاريع'],
      ['engineers', 'المهندسون والاستشاريون'],
      ['procurement', 'فرق المشتريات'],
      ['investors', 'المستثمرون والممولون'],
      ['operators', 'المشغلون وفرق الأصول'],
    ],
    location: 'الموقع والدولة — اختياري',
    locationPh: '',
    stage: 'مرحلة المشروع — اختياري',
    stagePh: 'اختر المرحلة',
    service: 'الخدمة المطلوبة',
    servicePh: 'اختر الخدمة',
    req: 'المتطلبات',
    reqPh: 'الهدف والموقع والأجهزة أو التقييم المطلوب والمواعيد',
    timing: 'موعد البدء المستهدف — اختياري',
    role: 'دورك في المشروع — اختياري',
    rolePh: 'اختر دورك',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    company: 'الشركة — اختياري',
    consent: 'أوافق على التواصل معي بخصوص هذا الاستفسار.',
    privacy: 'الخصوصية والاستفسارات',
    privacyHref: '/ar/privacy',
    steps: ['الخطوة 1 من 3 · نطاق المشروع', 'الخطوة 2 من 3 · بيانات التواصل', 'الخطوة 3 من 3 · المراجعة والإرسال'],
    back: ['رجوع إلى النطاق', 'تعديل بيانات التواصل'],
    next: 'تابع إلى بيانات التواصل ↗',
    send: 'أرسل الاستفسار ↗',
    sending: 'جارٍ الإرسال…',
    recap: (s: string, l: string, st: string) => `نطاقك: ${s} · ${l || 'الموقع قيد التأكيد'} · ${st || 'المرحلة قيد التأكيد'}`,
    saved: 'شكرًا لك — وصل استفسارك إلى فريقنا. نسخة من الرسالة جاهزة أدناه إذا رغبت في إرسالها بالبريد أيضًا.',
    failed: 'تعذر حفظ الاستفسار عبر الموقع. افتح تطبيق البريد أدناه لإرساله.',
    copied: (e: string) => `تم نسخ الرسالة. ألصقها في رسالة إلى ${e}.`,
    copyFail: 'حدد المسودة في الحقل وانسخها.',
    preview: 'راجع استفسارك',
    previewAria: 'مسودة الرسالة',
    copy: 'انسخ الرسالة',
    open: 'افتح تطبيق البريد ↗',
    subject: 'استفسار مشروع — ',
    draft: (d: Record<string, string>) =>
      `استفسار مشروع — EnviroMET\n\nالاسم: ${d.name}\nالبريد: ${d.email}\nالشركة: ${d.company || 'غير محدد'}\n` +
      `الموقع / الدولة: ${d.location || 'غير محدد'}\nمرحلة المشروع: ${d.stage || 'غير محدد'}\n` +
      `الدور: ${d.role || 'غير محدد'}\nالخدمة: ${d.service}\nموعد البدء: ${d.timing || 'غير محدد'}\n\n` +
      `المتطلبات:\n${d.requirements}\n\nالموافقة: التواصل بخصوص الاستفسار.` +
      (d.source ? `\nReference: ${d.source}` : ''),
  },
}

/**
 * Three-step project enquiry (English or Arabic).
 * On completion the enquiry is saved to the CMS (Leads → Enquiries) through
 * Payload's REST API, and an email draft is prepared for the visitor as before.
 */
export function EnquiryForm({
  heading,
  help,
  note,
  services,
  stages,
  email,
  locale = 'en',
}: {
  heading?: string | null
  help?: string | null
  note?: string | null
  services: Option[]
  stages: Option[]
  email: string
  locale?: 'en' | 'ar'
}) {
  const t = T[locale]
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState<Step>('scope')
  const [recap, setRecap] = useState('')
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [chosenService, setChosenService] = useState('')

  const optValue = (o: Option) => o.value || o.label

  // Pre-select service / role from the URL, e.g. /contact?service=wind.
  // Read with useSyncExternalStore: "" while pre-rendering, the real query string in the browser.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => '')
  const defaults = useMemo(() => {
    const p = new URLSearchParams(search)
    const found = services.find((s) => s.key && s.key === p.get('service'))
    const role = t.roles.some(([v]) => v === p.get('role')) ? p.get('role')! : ''
    const regions: Record<string, string> = { 'saudi-arabia': 'Saudi Arabia', gcc: 'GCC', 'middle-east': 'Middle East', africa: 'Africa' }
    const source = /^[a-z0-9-]{1,70}$/.test(p.get('source') || '') ? p.get('source')! : ''
    return { service: found ? found.value || found.label : '', role, location: regions[p.get('region') || ''] ?? '', source }
  }, [search, services, t])

  const focusFirst = () =>
    setTimeout(
      () =>
        formRef.current
          ?.querySelector<HTMLElement>(
            '[data-enquiry-step]:not([hidden]) input, [data-enquiry-step]:not([hidden]) select, [data-enquiry-step]:not([hidden]) textarea',
          )
          ?.focus(),
      0,
    )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>

    if (step === 'scope') {
      setRecap(t.recap(d.service, d.location, d.stage))
      setChosenService(d.service)
      setStep('contact')
      focusFirst()
      return
    }

    setSaving(true)
    let saved = false
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          company: d.company,
          service: d.service,
          stage: d.stage,
          role: d.role,
          location: d.location,
          timing: d.timing,
          source: d.source || (locale === 'ar' ? 'arabic-site' : ''),
          requirements: d.requirements,
          consent: d.consent === 'yes',
        }),
      })
      saved = res.ok
    } catch {
      saved = false
    }
    setSaving(false)
    setDraft(t.draft(d))
    setStep('review')
    setStatus(saved ? t.saved : t.failed)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setStatus(t.copied(email))
    } catch {
      formRef.current?.querySelector<HTMLTextAreaElement>('#draft-text')?.select()
      setStatus(t.copyFail)
    }
  }

  const mailto = `mailto:${email}?subject=${encodeURIComponent(t.subject + chosenService)}&body=${encodeURIComponent(draft)}`
  const stepLabel = t.steps[step === 'scope' ? 0 : step === 'contact' ? 1 : 2]
  const hideScope = step !== 'scope'
  const hideContact = step !== 'contact'

  return (
    <form id="enquiry-form" ref={formRef} onSubmit={onSubmit} key={defaults.service + defaults.role}>
      <input type="hidden" name="source" defaultValue={defaults.source} />
      {recap && step !== 'scope' && <p className="cro-summary">{recap}</p>}
      {heading && <h2>{heading}</h2>}
      {help && <p className="form-help">{help}</p>}
      <p className="b2b-step-status" role="status" aria-live="polite" aria-atomic="true">
        {stepLabel}
      </p>

      {/* Hidden steps keep their values in FormData; `required` only applies to the visible step. */}
      <div className="form-row" data-enquiry-step="scope" hidden={hideScope}>
        <label>
          {t.location}
          <input name="location" placeholder={t.locationPh || undefined} maxLength={180} defaultValue={defaults.location} />
        </label>
        <label>
          {t.stage}
          <select name="stage" defaultValue="">
            <option value="">{t.stagePh}</option>
            {stages.map((s) => (
              <option key={s.label} value={optValue(s)}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label data-enquiry-step="scope" hidden={hideScope}>
        {t.service}
        <select name="service" required={step === 'scope'} defaultValue={defaults.service}>
          <option value="">{t.servicePh}</option>
          {services.map((s) => (
            <option key={s.label} value={optValue(s)}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label data-enquiry-step="scope" hidden={hideScope}>
        {t.req}
        <textarea name="requirements" rows={5} required={step === 'scope'} maxLength={4000} minLength={10} placeholder={t.reqPh} />
      </label>
      <label data-enquiry-step="scope" hidden={hideScope}>
        {t.timing}
        <input type="date" name="timing" />
      </label>
      <label data-enquiry-step="scope" hidden={hideScope}>
        {t.role}
        <select name="role" defaultValue={defaults.role}>
          <option value="">{t.rolePh}</option>
          {t.roles.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row" data-enquiry-step="contact" hidden={hideContact}>
        <label>
          {t.name}
          <input name="name" autoComplete="name" required={step === 'contact'} maxLength={120} />
        </label>
        <label>
          {t.email}
          <input
            name="email"
            type="email"
            autoComplete="email"
            dir={locale === 'ar' ? 'ltr' : undefined}
            required={step === 'contact'}
            maxLength={160}
          />
        </label>
      </div>
      <label data-enquiry-step="contact" hidden={hideContact}>
        {t.company}
        <input name="company" autoComplete="organization" maxLength={160} />
      </label>
      <label className="b2b-consent" data-enquiry-step="contact" hidden={hideContact}>
        <input type="checkbox" name="consent" value="yes" required={step === 'contact'} />
        <span>
          {t.consent} <a href={t.privacyHref}>{t.privacy}</a>
        </span>
      </label>

      {note && <p className="small-note">{note}</p>}
      <button
        className="button secondary b2b-back"
        type="button"
        hidden={step === 'scope'}
        onClick={() => {
          setStatus('')
          setStep(step === 'review' ? 'contact' : 'scope')
          focusFirst()
        }}
      >
        {step === 'review' ? t.back[1] : t.back[0]}
      </button>
      <button className="button" type="submit" hidden={step === 'review'} disabled={saving}>
        {step === 'scope' ? t.next : saving ? t.sending : t.send}
      </button>
      <p id="form-status" role="status">
        {status}
      </p>
      <div id="email-preview" hidden={step !== 'review'}>
        <h3>{t.preview}</h3>
        <textarea id="draft-text" readOnly rows={10} aria-label={t.previewAria} value={draft} />
        <button type="button" className="button secondary" id="copy-enquiry" onClick={copy}>
          {t.copy}
        </button>
        <a id="email-link" className="text-link" href={mailto}>
          {t.open}
        </a>
      </div>
    </form>
  )
}
