import type { getPageInfo } from '@/lib/notion/page-info'
import { ProjectIcon } from './project-icon'
import { Icon, type IconName } from './ui/icon'

type Project = NonNullable<ReturnType<typeof getPageInfo>['project']>

export function ProjectDetails({
  pageId,
  project,
  summary,
  tags,
}: {
  pageId: string
  project: Project
  summary: string
  tags: string[]
}) {
  const links = [
    { label: 'Website', href: project.website, icon: 'globe' },
    {
      label: 'Repository',
      href: project.repository,
      icon: project.repository?.includes('github.com') ? 'github' : 'external',
    },
  ].filter((link): link is { label: string; href: string; icon: IconName } => !!link.href)

  return (
    <div className="project-details" lang="en">
      {summary && (
        <p className="project-summary" lang="id">
          {summary}
        </p>
      )}
      <div className="project-meta">
        <ProjectIcon pageId={pageId} />
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
                    month: 'long',
                    year: 'numeric',
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
      </div>
      {links.length > 0 && (
        <div className="project-links">
          {links.map(({ label, href, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              <Icon name={icon} width={16} height={16} />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
