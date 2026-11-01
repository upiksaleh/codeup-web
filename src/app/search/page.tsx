import type { Metadata } from 'next'
import Link from 'next/link'
import { getRecentPages, normalizeSearchQuery, searchSitePages } from '@/lib/notion/search'
import { Highlight } from '@/components/highlight'
import { Icon } from '@/components/ui/icon'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const query = normalizeSearchQuery(q)
  const results = query ? await searchSitePages(query) : await getRecentPages(8)

  return (
    <main className="search-page" lang="en">
      <header className="search-page-header">
        <h1>Search</h1>
        <p>Find articles, projects, notes, and pages.</p>
      </header>
      <search className="search-panel" aria-label="Site search">
        <form action="/search" className="search-form">
          <label htmlFor="search-query">Search all content</label>
          <div className="search-form-row">
            <div className="search-input-field">
              <Icon name="search" />
              <input
                id="search-query"
                name="q"
                type="search"
                defaultValue={query}
                maxLength={200}
                placeholder="What are you looking for?"
                aria-describedby="search-help"
              />
            </div>
            <button type="submit" className="search-submit">
              Search <Icon name="chevronRight" width={18} height={18} />
            </button>
          </div>
          <p id="search-help">Try a topic, project name, or a few keywords.</p>
        </form>
      </search>
      <section className="search-results-section" aria-labelledby="search-results-heading">
        <div className="search-results-header">
          <h2 id="search-results-heading">
            {query
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
              : 'Recent content'}
          </h2>
          {query && (
            <Link className="search-clear" href="/search">
              Clear search <Icon name="close" width={16} height={16} />
            </Link>
          )}
        </div>
        <p className="search-results-context">
          {query ? (
            <>
              Results for <strong>“{query}”</strong>
            </>
          ) : (
            'Recently updated content from across CodeUP.'
          )}
        </p>
        {results.length ? (
          <ul className="search-results" lang="id">
            {results.map(({ id, url, title, description, label, snippet }) => (
              <li key={id}>
                <Link className="search-result" href={url}>
                  <div>
                    <span className="search-result-label" lang="en">
                      {label}
                    </span>
                    <h3>
                      <Highlight text={title} query={query} />
                    </h3>
                    {(snippet || description) && (
                      <p>
                        <Highlight text={snippet || description} query={query} />
                      </p>
                    )}
                  </div>
                  <Icon name="chevronRight" className="search-result-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="search-empty">
            <span className="search-empty-icon">
              <Icon name="search" width={28} height={28} />
            </span>
            <h3>{query ? 'No matches found' : 'Nothing to show yet'}</h3>
            <p>
              {query
                ? 'Try fewer words, check the spelling, or browse a collection.'
                : 'Browse the collections to explore CodeUP.'}
            </p>
            <div className="search-browse-links">
              <Link href="/articles">
                Browse articles <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects">
                Explore projects <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
