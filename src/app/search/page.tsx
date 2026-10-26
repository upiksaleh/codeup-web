import type { Metadata } from 'next'
import Link from 'next/link'
import { normalizeSearchQuery, searchSitePages } from '@/lib/notion/search'
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
  const results = await searchSitePages(query)

  return (
    <main className="page-state search-page" lang="en">
      <h1>Search</h1>
      <search>
        <form action="/search" className="search-form">
          <label htmlFor="search-query">Search pages and articles</label>
          <div>
            <input id="search-query" name="q" type="search" defaultValue={query} maxLength={200} />
            <button type="submit">
              <Icon name="search" />
              Search
            </button>
          </div>
        </form>
      </search>
      {query && (
        <p>
          {results.length
            ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query}”`
            : `No results for “${query}”`}
        </p>
      )}
      <ul className="search-results" lang="id">
        {results.map(({ id, url, title, description, label, snippet }) => (
          <li key={id}>
            <span className="search-result-label" lang="en">
              {label}
            </span>
            <h2>
              <Link href={url}>
                <Highlight text={title} query={query} />
              </Link>
            </h2>
            {(snippet || description) && (
              <p>
                <Highlight text={snippet || description} query={query} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
