import type { Block } from 'payload'
import { Actions } from './Actions/config'
import { CallToAction } from './CallToAction/config'
import { CapabilityCards } from './CapabilityCards/config'
import { CardGrid } from './CardGrid/config'
import { ContactSection } from './ContactSection/config'
import { HeroSlider } from './HeroSlider/config'
import { LogoGrid } from './LogoGrid/config'
import { NumbersGrid } from './NumbersGrid/config'
import { PageIntro } from './PageIntro/config'
import { Process } from './Process/config'
import { ProjectsGrid } from './ProjectsGrid/config'
import { SectionBlock } from './Section/config'
import { SharedSection } from './SharedSection/config'
import { Split } from './Split/config'
import { StatsBar } from './StatsBar/config'
import { withSectionControls } from './sectionControls'

/**
 * Block configs only (no React): this file is loaded by Payload in Node.
 * Each block lives in its own folder: config.ts (CMS fields) + Component.tsx (website rendering).
 * Every top-level section gets show / hide controls (see sectionControls.ts).
 */

/** Content sections: used by pages, solutions, templates and the shared-sections library itself. */
export const contentBlocks: Block[] = [
  SectionBlock,
  HeroSlider,
  PageIntro,
  StatsBar,
  CapabilityCards,
  Split,
  ProjectsGrid,
  Process,
  CardGrid,
  LogoGrid,
  NumbersGrid,
  Actions,
  CallToAction,
  ContactSection,
].map(withSectionControls)

/** Page layouts can also place a section from the shared library (a library section cannot nest another one). */
export const pageBlocks: Block[] = [...contentBlocks, withSectionControls(SharedSection)]
