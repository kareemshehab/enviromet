'use client'
import React, { useState } from 'react'
import type { Project } from '@/payload-types'
import { ProjectCard } from '@/components/ui/ProjectCard'

/** Category filter for the full project portfolio (cards are server-rendered, filtering is client-side). */
export function ProjectsExplorer({ categories, projects }: { categories: string[]; projects: Project[] }) {
  const ALL = 'All projects'
  const [active, setActive] = useState(ALL)
  const count = projects.filter((p) => active === ALL || p.category === active).length

  return (
    <>
      <div className="filters" role="group" aria-label="Filter reference projects">
        {[ALL, ...categories].map((c) => (
          <button
            key={c}
            className={`filter project-filter${c === active ? ' active' : ''}`}
            aria-pressed={c === active}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p id="project-count" role="status" className="small-note">
        {count} reference project{count === 1 ? '' : 's'}
      </p>
      <div className="project-grid">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} hidden={active !== ALL && p.category !== active} />
        ))}
      </div>
    </>
  )
}
