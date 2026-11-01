'use client'

import { useRef, useState } from 'react'
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

const copy = {
  article: {
    title: 'Articles',
    noun: ['article', 'articles'],
    intro: 'New things I learn, experiences, and the stories behind my projects.',
  },
  project: {
    title: 'Projects',
    noun: ['project', 'projects'],
    intro:
      'Personal and open source work, full-time and part-time roles, and freelance projects, as far as they can be published.',
  },
} as const

const pageSize = 12
// The unfiltered first page opens with a full-width lead card, then a full grid.
const leadPageSize = pageSize + 1

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

// Most used tags first, so the common topics stay visible without scrolling.
function countTags(entries: Entry[]) {
  const counts = new Map<string, number>()
  for (const tag of entries.flatMap((entry) => entry.tags))
    counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

// A short last page joins the previous one instead of showing a lone row.
const minLastPage = 4

function getPageStarts(total: number, firstPageSize: number) {
  const starts = [0]
  for (let start = firstPageSize; start < total; start += pageSize) starts.push(start)
  if (starts.length > 1 && total - starts.at(-1)! < minLastPage) starts.pop()
  return starts
}

// Page numbers with gaps, e.g. 1 … 4 5 6 … 9.
function pageItems(current: number, count: number) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  const pages = [...new Set([1, current - 1, current, current + 1, count])]
    .filter((page) => page >= 1 && page <= count)
    .sort((a, b) => a - b)
  return pages.flatMap((page, index) =>
    index && page - pages[index - 1]! > 1 ? ['gap' as const, page] : [page],
  )
}

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
    <div className="entry-select-field">
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
  const resultsRef = useRef<HTMLDivElement>(null)
  const { title, noun, intro } = copy[kind]
  const tags = countTags(entries)
  const stacks = uniqueSorted(entries.flatMap((entry) => entry.techStack))
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const filtering = terms.length > 0 || !!tag || !!stack
  const filtered = entries.filter((entry) => {
    const text =
      `${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.techStack.join(' ')}`.toLocaleLowerCase()
    return (
      (!tag || entry.tags.includes(tag)) &&
      (!stack || entry.techStack.includes(stack)) &&
      terms.every((term) => text.includes(term))
    )
  })
  const pageStarts = getPageStarts(filtered.length, filtering ? pageSize : leadPageSize)
  const pageCount = pageStarts.length
  const currentPage = Math.min(page, pageCount)
  const start = pageStarts[currentPage - 1]!
  const visible = filtered.slice(start, pageStarts[currentPage] ?? filtered.length)
  const lead = !filtering && currentPage === 1 && visible.length > 1

  const nounFor = (count: number) => (count === 1 ? noun[0] : noun[1])
  const update = (apply: () => void) => {
    apply()
    setPage(1)
  }
  const clearFilters = () =>
    update(() => {
      setQuery('')
      setTag('')
      setStack('')
    })
  const goToPage = (next: number) => {
    setPage(next)
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    resultsRef.current?.scrollIntoView({
      block: 'start',
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <main className="entry-listing" data-kind={kind} lang="en">
      <header className="entry-listing-header">
        <h1>{title}</h1>
        <p>{intro}</p>
        <dl className="entry-listing-stats">
          <div>
            <dt>{noun[1]}</dt>
            <dd>{entries.length}</dd>
          </div>
          <div>
            <dt>Topics</dt>
            <dd>{tags.length}</dd>
          </div>
          {stacks.length > 0 && (
            <div>
              <dt>Technologies</dt>
              <dd>{stacks.length}</dd>
            </div>
          )}
        </dl>
      </header>

      <search className="entry-filters" aria-label={`Filter ${noun[1]}`}>
        <div className="entry-filter-row">
          <div className="entry-search-field">
            <Icon name="search" />
            <input
              type="search"
              aria-label={`Search ${noun[1]}`}
              value={query}
              maxLength={200}
              placeholder={`Search ${noun[1]} by title, summary, or tag`}
              onChange={(event) => update(() => setQuery(event.target.value))}
            />
          </div>
          {stacks.length > 0 && (
            <FilterSelect
              label="Filter by technology"
              allLabel="All technologies"
              value={stack}
              options={stacks}
              onChange={(value) => update(() => setStack(value))}
            />
          )}
        </div>
        {tags.length > 0 && (
          <fieldset className="entry-topics">
            <legend className="sr-only">Filter by topic</legend>
            <button type="button" aria-pressed={!tag} onClick={() => update(() => setTag(''))}>
              All
            </button>
            {tags.map(([name, count]) => (
              <button
                key={name}
                type="button"
                aria-pressed={tag === name}
                onClick={() => update(() => setTag(tag === name ? '' : name))}
              >
                {name}
                <span aria-hidden="true">{count}</span>
              </button>
            ))}
          </fieldset>
        )}
      </search>

      <div className="entry-results" ref={resultsRef}>
        <div className="entry-results-bar">
          <output aria-live="polite">
            {filtered.length
              ? `Showing ${start + 1}–${start + visible.length} of ${filtered.length} ${nounFor(filtered.length)}`
              : `No ${noun[1]} found`}
          </output>
          {filtering && (
            <button type="button" className="entry-clear" onClick={clearFilters}>
              <Icon name="close" />
              Clear filters
            </button>
          )}
        </div>

        {visible.length ? (
          <div className="entry-gallery" data-lead={lead || undefined}>
            <EntryGallery
              gallery={gallery}
              pageIds={visible.map(({ id }) => id)}
              pageUrls={Object.fromEntries(entries.map(({ id, url }) => [id, url]))}
            />
          </div>
        ) : (
          <div className="entry-empty">
            <Icon name="search" />
            <p>
              {entries.length
                ? `No ${noun[1]} match these filters. Try another search or topic.`
                : `No ${noun[1]} yet.`}
            </p>
            {filtering && (
              <button type="button" className="entry-clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {pageCount > 1 && (
          <nav className="entry-pagination" aria-label="Pagination">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <Icon name="chevronLeft" />
            </button>
            {pageItems(currentPage, pageCount).map((item, index) =>
              item === 'gap' ? (
                <span key={`gap-${index}`} aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? 'page' : undefined}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => goToPage(currentPage + 1)}
            >
              <Icon name="chevronRight" />
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}
