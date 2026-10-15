export type MediaMap = Record<string, number>

import { legacyToRoute } from '../lib/routes'

/** Converts legacy relative links (about.html#x, contact.html?service=wind, ar-about.html) to site paths. */
export const url = (href: string): string => legacyToRoute(href)

type Appearance = 'button' | 'secondary' | 'white' | 'text' | 'plain'

export const L = (label: string, href: string, appearance: Appearance = 'plain', newTab = false) => ({
  type: 'custom' as const,
  label,
  url: url(href),
  appearance,
  newTab,
})
