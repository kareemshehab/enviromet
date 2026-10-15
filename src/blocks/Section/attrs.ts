/** Converts stored HTML attributes ({"data-x": "", "aria-label": "…"}) into React props. */
const rename: Record<string, string> = {
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  autocomplete: 'autoComplete',
  inputmode: 'inputMode',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  crossorigin: 'crossOrigin',
  playsinline: 'playsInline',
  novalidate: 'noValidate',
}
const booleans = new Set(['hidden', 'open', 'download', 'disabled', 'required', 'checked', 'playsInline', 'controls', 'muted', 'autoPlay', 'loop'])

export function attrsToProps(attrs: unknown): Record<string, unknown> {
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(attrs as Record<string, unknown>)) {
    if (k === 'class' || k === 'style') continue
    const key = rename[k] ?? k
    if (booleans.has(key)) {
      // `download` with a filename keeps its value; empty means boolean attribute
      out[key] = key === 'download' && typeof v === 'string' && v ? v : true
    } else out[key] = v
  }
  return out
}

/** Inline HTML from the CMS: newlines become <br>. Content is authored by trusted CMS users. */
export const inline = (text?: string | null) => ({ __html: (text ?? '').replace(/\r?\n/g, '<br>') })

/** Paragraph text: blank lines split paragraphs; content already containing block tags is used as-is. */
export const paragraphsHtml = (text?: string | null) => {
  const t = (text ?? '').trim()
  if (/<(p|ul|ol|div|h\d)[\s>]/i.test(t)) return { __html: t }
  return {
    __html: t
      .split(/\r?\n\s*\r?\n/)
      .map((p) => `<p>${p.trim().replace(/\r?\n/g, '<br>')}</p>`)
      .join(''),
  }
}
