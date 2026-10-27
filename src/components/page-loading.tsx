export function PageLoading() {
  return (
    <main className="page-state page-loading" lang="en" aria-busy="true">
      <div className="page-loading-bar" aria-hidden="true" />
      <output className="sr-only" aria-live="polite">
        Loading…
      </output>
      <div className="page-loading-skeleton" aria-hidden="true">
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-meta" />
        <span className="skeleton skeleton-cover" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
    </main>
  )
}
