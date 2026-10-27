'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { canOptimizeImage } from '@/lib/notion/image-source'
import { Icon } from './ui/icon'

type Entry = {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  image?: string
  published: number
}

const pageSize = 12

function EntryCard({ entry, showDate }: { entry: Entry; showDate: boolean }) {
  const [failedSource, setFailedSource] = useState(false)

  return (
    <li className="entry-card">
      <Link href={entry.url}>
        {entry.image && (
          <div className="entry-cover">
            <Image
              src={entry.image}
              alt=""
              fill
              sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 50vw, 360px"
              unoptimized={failedSource || !canOptimizeImage(entry.image)}
              onError={() => setFailedSource(true)}
            />
          </div>
        )}
        <div className="entry-card-content" lang="id">
          <h2>{entry.title}</h2>
          {showDate && (
            <time dateTime={new Date(entry.published).toISOString()} lang="en">
              {new Date(entry.published).toLocaleDateString('en-US', {
                dateStyle: 'long',
                timeZone: 'UTC',
              })}
            </time>
          )}
          {entry.description && <p>{entry.description}</p>}
          {entry.tags.length > 0 && (
            <ul className="entry-tags" aria-label="Tags">
              {entry.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </li>
  )
}

export function EntryListing({ kind, entries }: { kind: 'article' | 'project'; entries: Entry[] }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const title = kind === 'article' ? 'Articles' : 'Projects'
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort((a, b) =>
    a.localeCompare(b),
  )
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const filtered = entries.filter((entry) => {
    const text = `${entry.title} ${entry.description} ${entry.tags.join(' ')}`.toLocaleLowerCase()
    return (!tag || entry.tags.includes(tag)) && terms.every((term) => text.includes(term))
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <main className="entry-listing" lang="en">
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
        <ul className="entry-grid">
          {visible.map((entry) => (
            <EntryCard key={entry.id} entry={entry} showDate={kind === 'article'} />
          ))}
        </ul>
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
