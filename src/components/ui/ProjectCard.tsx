import React from 'react'
import type { Project } from '@/payload-types'
import { Img, SmartLink } from './primitives'

export function ProjectCard({ project, hidden }: { project: Project; hidden?: boolean }) {
  const body = (
    <>
      <div className="project-image">
        <Img media={project.image} alt={project.title} />
        <span>{project.badge}</span>
        {project.imageNote && <small>{project.imageNote}</small>}
      </div>
      <div className="project-copy">
        <p className="eyebrow">{project.category}</p>
        <h3>{project.title}</h3>
        <dl className="refine-case-facts">
          <div>
            <dt>Challenge</dt>
            <dd>{project.challenge}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{project.delivery}</dd>
          </div>
          <div>
            <dt>Documented scope</dt>
            <dd>{project.scope}</dd>
          </div>
        </dl>
        <b>Explore this use case ↗</b>
      </div>
    </>
  )
  return (
    <article className="project-card" data-project-category={project.category} hidden={hidden}>
      <SmartLink href={`/${project.slug}`}>{body}</SmartLink>
    </article>
  )
}
