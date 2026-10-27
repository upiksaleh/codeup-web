// Mirrors the page shapes: articles and projects use a wide header with a table of contents.
export function PageLoading({ article = false }: { article?: boolean }) {
  return (
    <main className={article ? 'page-loading page-loading-article' : 'page-loading'} lang="en">
      <div className="page-loading-bar" aria-hidden="true" />
      <output className="sr-only" aria-live="polite">
        Loading…
      </output>
      <div className="skeleton-cover" aria-hidden="true">
        <canvas className="pointer-trail" />
      </div>
      <div className="page-loading-body" aria-hidden="true">
        <span className="skeleton skeleton-title" />
        {article && (
          <div className="skeleton-meta">
            <span className="skeleton skeleton-icon" />
            <span className="skeleton-meta-lines">
              <span className="skeleton skeleton-tags" />
              <span className="skeleton skeleton-date" />
            </span>
          </div>
        )}
        <div className="skeleton-columns">
          <div className="skeleton-text">
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line skeleton-line-short" />
          </div>
          {article && (
            <div className="skeleton-toc">
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line" />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export function ArticleLoading() {
  return <PageLoading article />
}
