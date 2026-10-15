import React from 'react'
import type { Project } from '@/payload-types'
import { getAllProjects } from '@/lib/data'
import { asLink } from '@/lib/links'
import { projectCategories } from '@/collections/Projects'
import { CMSLink, Eyebrow, Lines, sectionClass } from '@/components/ui/primitives'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ProjectsExplorer } from './ProjectsExplorer.client'
import type { BlockData } from '../types'

export async function ProjectsGridBlock({ block }: { block: BlockData<'projectsGrid'> }) {
  const projects: Project[] =
    block.source === 'all'
      ? await getAllProjects()
      : (block.projects ?? []).filter((p): p is Project => typeof p === 'object' && p !== null)

  return (
    <section className={sectionClass('section', block.background)} id={block.anchorId || undefined}>
      <div className="wrap">
        <div className="section-heading">
          <div>
            <Eyebrow text={block.eyebrow} />
            <h2>
              <Lines text={block.heading} />
            </h2>
          </div>
          <CMSLink link={asLink(block.headerLink)} appearance="text" />
        </div>
        {block.source === 'all' && block.showFilters ? (
          <ProjectsExplorer categories={[...projectCategories]} projects={projects} />
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
        {block.note && <p className="small-note">{block.note}</p>}
      </div>
    </section>
  )
}
