/* Plain data (no Payload or Next imports): shared by the global config, the admin UI and the website. */

/** The parts every solution page is built from, in their original order. */
export const solutionParts = [
  { value: 'hero', label: 'Page intro (title, lede, image)' },
  { value: 'coverage', label: 'Highlight figure' },
  { value: 'subnav', label: 'Quick links bar' },
  { value: 'solution', label: 'Solution, scope and sidebar' },
  { value: 'evidence', label: 'Related projects' },
  { value: 'brief', label: 'Requirements brief and FAQs' },
  { value: 'businessCase', label: 'Business case strip' },
  { value: 'technicalBasis', label: 'Technical basis' },
  { value: 'extraSections', label: "The solution's extra sections" },
  { value: 'cta', label: 'Closing banner' },
] as const

export type SolutionPart = (typeof solutionParts)[number]['value']
