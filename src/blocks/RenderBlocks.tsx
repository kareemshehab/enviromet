import React from 'react'
import type { LayoutBlock } from './types'
import { ActionsBlock } from './Actions/Component'
import { CtaBanner } from './CallToAction/Component'
import { CapabilityCardsBlock } from './CapabilityCards/Component'
import { CardGridBlock } from './CardGrid/Component'
import { ContactSectionBlock } from './ContactSection/Component'
import { HeroSliderBlock } from './HeroSlider/Component'
import { LogoGridBlock } from './LogoGrid/Component'
import { NumbersGridBlock } from './NumbersGrid/Component'
import { PageIntroBlock } from './PageIntro/Component'
import { ProcessBlock } from './Process/Component'
import { ProjectsGridBlock } from './ProjectsGrid/Component'
import { SectionRenderer } from './Section/Component'
import { SharedSectionBlock } from './SharedSection/Component'
import { SplitBlock } from './Split/Component'
import { StatsBarBlock } from './StatsBar/Component'

/** Server component: renders a page layout block by block (sections switched off in the CMS are skipped). */
export function RenderBlocks({ blocks }: { blocks?: LayoutBlock[] | null }) {
  const visible = blocks?.filter((block) => !block.hidden)
  if (!visible?.length) return null
  return (
    <>
      {visible.map((block, i) => {
        const key = block.id ?? i
        switch (block.blockType) {
          case 'section':
            return <SectionRenderer key={key} block={block} />
          case 'heroSlider':
            return <HeroSliderBlock key={key} block={block} />
          case 'pageIntro':
            return <PageIntroBlock key={key} block={block} />
          case 'statsBar':
            return <StatsBarBlock key={key} block={block} />
          case 'capabilityCards':
            return <CapabilityCardsBlock key={key} block={block} />
          case 'split':
            return <SplitBlock key={key} block={block} />
          case 'projectsGrid':
            return <ProjectsGridBlock key={key} block={block} />
          case 'process':
            return <ProcessBlock key={key} block={block} />
          case 'cardGrid':
            return <CardGridBlock key={key} block={block} />
          case 'logoGrid':
            return <LogoGridBlock key={key} block={block} />
          case 'numbersGrid':
            return <NumbersGridBlock key={key} block={block} />
          case 'actions':
            return <ActionsBlock key={key} block={block} />
          case 'cta':
            return <CtaBanner key={key} data={block.useDefault ? null : block.custom} />
          case 'contactSection':
            return <ContactSectionBlock key={key} block={block} />
          case 'sharedSection':
            return <SharedSectionBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
