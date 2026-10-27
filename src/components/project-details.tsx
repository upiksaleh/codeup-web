import type { getPageInfo } from '@/lib/notion/page-info'

type Project = NonNullable<ReturnType<typeof getPageInfo>['project']>

export function ProjectDetails({
  project,
  summary,
  tags,
}: {
  project: Project
  summary: string
  tags: string[]
}) {
  const links = [
    { label: 'Website', href: project.website },
    { label: 'Repository', href: project.repository },
  ].filter((link) => link.href)

  return (
    <div className="project-details" lang="en">
      {summary && (
        <p className="project-summary" lang="id">
          {summary}
        </p>
      )}
      <dl>
        {project.status && (
          <div>
            <dt>Status</dt>
            <dd>
              <span className="project-status" data-status={project.status}>
                {project.status}
              </span>
            </dd>
          </div>
        )}
        {project.startDate !== undefined && (
          <div>
            <dt>Started</dt>
            <dd>
              <time dateTime={new Date(project.startDate).toISOString().slice(0, 10)}>
                {new Date(project.startDate).toLocaleDateString('en-US', {
                  dateStyle: 'long',
                  timeZone: 'UTC',
                })}
              </time>
            </dd>
          </div>
        )}
        {project.techStack.length > 0 && (
          <div>
            <dt>Tech stack</dt>
            <dd>
              <ul className="entry-tags">
                {project.techStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {tags.length > 0 && (
          <div>
            <dt>Tags</dt>
            <dd>
              <ul className="entry-tags">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      {links.length > 0 && (
        <div className="project-links">
          {links.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
