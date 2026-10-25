import type { Metadata } from 'next'
import Link from 'next/link'
import { getSitePages } from '@/lib/notion/site-pages'

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
  const query = typeof q === 'string' ? q.trim().slice(0, 200) : ''
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const results = terms.length
    ? (await getSitePages()).filter(({ searchText }) => {
        const text = searchText.toLocaleLowerCase()
        return terms.every((term) => text.includes(term))
      })
    : []

  return (
    <main className="page-state search-page" lang="en">
      <h1>Search</h1>
      <search>
        <form action="/search" className="search-form">
          <label htmlFor="search-query">Search pages and articles</label>
          <div>
            <input id="search-query" name="q" type="search" defaultValue={query} maxLength={200} />
            <button type="submit">Search</button>
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
        {results.map(({ id, url, title, description }) => (
          <li key={id}>
            <h2>
              <Link href={url}>{title}</Link>
            </h2>
            {description && <p>{description}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}
