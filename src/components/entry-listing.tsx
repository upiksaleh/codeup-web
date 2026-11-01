'use client'

import { useRef, type MouseEvent } from 'react'
import { EntryGallery, type EntryGalleryData } from './entry-gallery'
import { Icon } from './ui/icon'
import { useListingLocation } from './use-listing-location'

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
  const { params, navigate } = useListingLocation()
  const resultsRef = useRef<HTMLOutputElement>(null)
  const { title, noun, intro } = copy[kind]
  const tags = countTags(entries)
  const stacks = uniqueSorted(entries.flatMap((entry) => entry.techStack))
  const query = (params.get('q') ?? '').slice(0, 200)
  const tag = tags.find(([name]) => name === params.get('tag'))?.[0] ?? ''
  const stack = stacks.find((name) => name === params.get('stack')) ?? ''
  const pageParam = params.get('page') ?? '1'
  const page =
    /^[1-9]\d*$/.test(pageParam) && Number.isSafeInteger(Number(pageParam)) ? Number(pageParam) : 1
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
  const listingUrl = (changes: { q?: string; tag?: string; stack?: string; page?: number }) => {
    const next = { q: query, tag, stack, page: currentPage, ...changes }
    const search = new URLSearchParams(params)
    for (const key of ['q', 'tag', 'stack', 'page'] as const) {
      if (!next[key] || (key === 'page' && next[key] === 1)) search.delete(key)
      else search.set(key, String(next[key]))
    }
    const suffix = search.toString()
    return `/${noun[1]}${suffix ? `?${suffix}` : ''}`
  }
  const clearFilters = () => navigate(listingUrl({ q: '', tag: '', stack: '', page: 1 }))
  const goToPage = (event: MouseEvent<HTMLAnchorElement>, next: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return
    event.preventDefault()
    navigate(listingUrl({ page: next }))
    requestAnimationFrame(() => {
      resultsRef.current?.focus({ preventScroll: true })
      resultsRef.current?.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    })
  }

  return (
    <main className="entry-listing" data-kind={kind}>
      <header className="entry-listing-header" lang="en">
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

      <search className="entry-filters" aria-label={`Filter ${noun[1]}`} lang="en">
        <div className="entry-filter-row">
          <div className="entry-search-field">
            <Icon name="search" />
            <input
              type="search"
              aria-label={`Search ${noun[1]}`}
              value={query}
              maxLength={200}
              placeholder={`Search ${noun[1]} by title, summary, or tag`}
              onChange={(event) => navigate(listingUrl({ q: event.target.value, page: 1 }), true)}
            />
          </div>
          {stacks.length > 0 && (
            <FilterSelect
              label="Filter by technology"
              allLabel="All technologies"
              value={stack}
              options={stacks}
              onChange={(value) => navigate(listingUrl({ stack: value, page: 1 }))}
            />
          )}
        </div>
        {tags.length > 0 && (
          <fieldset className="entry-topics">
            <legend className="sr-only">Filter by topic</legend>
            <button
              type="button"
              aria-pressed={!tag}
              onClick={() => navigate(listingUrl({ tag: '', page: 1 }))}
            >
              All
            </button>
            {tags.map(([name, count]) => (
              <button
                key={name}
                type="button"
                aria-pressed={tag === name}
                onClick={() => navigate(listingUrl({ tag: tag === name ? '' : name, page: 1 }))}
              >
                {name}
                <span aria-hidden="true">{count}</span>
              </button>
            ))}
          </fieldset>
        )}
      </search>

      <div className="entry-results">
        <div className="entry-results-bar" lang="en">
          <output aria-live="polite" tabIndex={-1} ref={resultsRef}>
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
          <div className="entry-empty" lang="en">
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
          <nav className="entry-pagination" aria-label="Pagination" lang="en">
            {currentPage === 1 ? (
              <button type="button" aria-label="Previous page" disabled>
                <Icon name="chevronLeft" />
              </button>
            ) : (
              <a
                href={listingUrl({ page: currentPage - 1 })}
                aria-label="Previous page"
                onClick={(event) => goToPage(event, currentPage - 1)}
              >
                <Icon name="chevronLeft" />
              </a>
            )}
            {pageItems(currentPage, pageCount).map((item, index) =>
              item === 'gap' ? (
                <span key={`gap-${index}`} aria-hidden="true">
                  …
                </span>
              ) : (
                <a
                  key={item}
                  href={listingUrl({ page: item })}
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? 'page' : undefined}
                  onClick={(event) => goToPage(event, item)}
                >
                  {item}
                </a>
              ),
            )}
            {currentPage === pageCount ? (
              <button type="button" aria-label="Next page" disabled>
                <Icon name="chevronRight" />
              </button>
            ) : (
              <a
                href={listingUrl({ page: currentPage + 1 })}
                aria-label="Next page"
                onClick={(event) => goToPage(event, currentPage + 1)}
              >
                <Icon name="chevronRight" />
              </a>
            )}
          </nav>
        )}
      </div>
    </main>
  )
}
