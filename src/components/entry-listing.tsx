'use client'

import { useState } from 'react'
import { EntryGallery, type EntryGalleryData } from './entry-gallery'
import { Icon } from './ui/icon'

type Entry = {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  techStack: string[]
}

const pageSize = 12

export function EntryListing({
  kind,
  entries,
  gallery,
}: {
  kind: 'article' | 'project'
  entries: Entry[]
  gallery: EntryGalleryData
}) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const title = kind === 'article' ? 'Articles' : 'Projects'
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort((a, b) =>
    a.localeCompare(b),
  )
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const filtered = entries.filter((entry) => {
    const text =
      `${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.techStack.join(' ')}`.toLocaleLowerCase()
    return (!tag || entry.tags.includes(tag)) && terms.every((term) => text.includes(term))
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <main className="entry-listing" data-kind={kind} lang="en">
      <h1>{title}</h1>
      <search className="entry-filters" aria-label={`Filter ${title.toLowerCase()}`}>
        <div className="entry-search-field">
          <Icon name="search" />
          <input
            type="search"
            aria-label={`Search ${title.toLowerCase()}`}
            value={query}
            maxLength={200}
            placeholder={`Search ${title.toLowerCase()}`}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="entry-tag-field">
          <select
            aria-label="Filter by tag"
            value={tag}
            onChange={(event) => {
              setTag(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All tags</option>
            {tags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" />
        </div>
      </search>
      <output className="entry-count">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
      </output>
      {visible.length ? (
        <EntryGallery
          gallery={gallery}
          pageIds={visible.map(({ id }) => id)}
          pageUrls={Object.fromEntries(entries.map(({ id, url }) => [id, url]))}
        />
      ) : (
        <p>
          {entries.length
            ? 'No matching results. Try another search or tag.'
            : `No ${title.toLowerCase()} yet.`}
        </p>
      )}
      {pageCount > 1 && (
        <nav className="entry-pagination" aria-label="Pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  )
}
