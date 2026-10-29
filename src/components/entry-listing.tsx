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

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string
  allLabel: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="entry-tag-field">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" />
    </div>
  )
}

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
  const [stack, setStack] = useState('')
  const [page, setPage] = useState(1)
  const title = kind === 'article' ? 'Articles' : 'Projects'
  const tags = uniqueSorted(entries.flatMap((entry) => entry.tags))
  const stacks = uniqueSorted(entries.flatMap((entry) => entry.techStack))
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const filtered = entries.filter((entry) => {
    const text =
      `${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.techStack.join(' ')}`.toLocaleLowerCase()
    return (
      (!tag || entry.tags.includes(tag)) &&
      (!stack || entry.techStack.includes(stack)) &&
      terms.every((term) => text.includes(term))
    )
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
        {stacks.length > 0 && (
          <FilterSelect
            label="Filter by tech stack"
            allLabel="All stacks"
            value={stack}
            options={stacks}
            onChange={(value) => {
              setStack(value)
              setPage(1)
            }}
          />
        )}
        <FilterSelect
          label="Filter by tag"
          allLabel="All tags"
          value={tag}
          options={tags}
          onChange={(value) => {
            setTag(value)
            setPage(1)
          }}
        />
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
            ? 'No matching results. Try another search or filter.'
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
