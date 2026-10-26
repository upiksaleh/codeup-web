'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from './ui/icon'
import { Modal } from './ui/modal'

type SearchResult = { id: string; url: string; title: string; description: string }
type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; query: string; total: number; results: SearchResult[] }
  | { status: 'error' }

export function SearchButton() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey) || event.altKey)
        return
      if (document.querySelector('dialog[open]')) return
      event.preventDefault()
      setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Link
        href="/search"
        className="icon-button search-trigger"
        aria-label="Search"
        title="Search (Ctrl+K or ⌘K)"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        <Icon name="search" />
      </Link>
      {open && (
        <Modal label="Search" className="search-dialog" onClose={() => setOpen(false)}>
          <QuickSearch onNavigate={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}

function QuickSearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<SearchState>({ status: 'idle' })
  const listRef = useRef<HTMLUListElement>(null)
  const trimmed = query.trim()

  useEffect(() => {
    if (!trimmed) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState({ status: 'loading' })
      try {
        const response = await fetch(`/search/results?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Search failed with ${response.status}`)
        const data: { total: number; results: SearchResult[] } = await response.json()
        setState({ status: 'done', query: trimmed, ...data })
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
          setState({ status: 'error' })
        }
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  // Arrow keys move between the input and the result links.
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const links = [...(listRef.current?.querySelectorAll('a') ?? [])]
    if (!links.length) return
    event.preventDefault()
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    const next = index + (event.key === 'ArrowDown' ? 1 : -1)
    if (next < 0) document.getElementById('quick-search')?.focus()
    else links[Math.min(next, links.length - 1)].focus()
  }

  const current = trimmed ? state : { status: 'idle' as const }

  return (
    <>
      <h2>Search</h2>
      <search>
        <form action="/search" className="search-form">
          <label htmlFor="quick-search">Search pages and articles</label>
          <div>
            <input
              id="quick-search"
              name="q"
              type="search"
              maxLength={200}
              autoComplete="off"
              required
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              aria-controls="quick-search-results"
            />
            <button type="submit" className="icon-button" aria-label="Show all results">
              <Icon name="search" />
            </button>
          </div>
        </form>
      </search>
      <output className="quick-search-status" aria-live="polite">
        {current.status === 'loading' && 'Searching…'}
        {current.status === 'error' && 'Quick results are unavailable. Press Enter to search.'}
        {current.status === 'done' &&
          (current.total
            ? `${current.total} ${current.total === 1 ? 'result' : 'results'}`
            : `No results for “${current.query}”`)}
      </output>
      {current.status === 'done' && current.results.length > 0 && (
        <ul id="quick-search-results" className="quick-search-results" ref={listRef} lang="id">
          {current.results.map(({ id, url, title, description }) => (
            <li key={id}>
              <Link href={url} onClick={onNavigate} onKeyDown={onKeyDown}>
                <strong>{title}</strong>
                {description && <span>{description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {current.status === 'done' && current.total > current.results.length && (
        <Link
          className="quick-search-all"
          href={`/search?q=${encodeURIComponent(current.query)}`}
          onClick={onNavigate}
        >
          Show all {current.total} results
        </Link>
      )}
      <p className="dialog-hint">↑↓ to move · Enter to open · Esc to close</p>
    </>
  )
}
