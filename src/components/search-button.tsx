'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type KeyboardEvent } from 'react'
import type { SearchResult } from '@/lib/notion/search'
import { Highlight } from './highlight'
import { Icon } from './ui/icon'
import { Modal } from './ui/modal'

type Results = { query: string; total: number; results: SearchResult[] }

const listId = 'search-palette-list'
const optionId = (index: number) => `search-palette-option-${index}`

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
          <SearchPalette onClose={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [data, setData] = useState<Results>()
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(0)
  const trimmed = query.trim()
  const results = data?.results ?? []
  const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(
      async () => {
        setLoading(true)
        try {
          const response = await fetch(`/search/results?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          })
          if (!response.ok) throw new Error(`Search failed with ${response.status}`)
          setData(await response.json())
          setActive(0)
          setFailed(false)
        } catch (error) {
          if (controller.signal.aborted) return
          console.error(error)
          setFailed(true)
        }
        setLoading(false)
      },
      trimmed ? 120 : 0,
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function open(url: string) {
    router.push(url)
    onClose()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!results.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((index) => (index + step + results.length) % results.length)
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      const result = data?.query === trimmed ? results[active] : undefined
      if (result) open(result.url)
      else if (trimmed) open(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  const status = failed
    ? 'Search is unavailable. Press Enter for the search page.'
    : !data
      ? 'Loading…'
      : !data.query
        ? 'Recent'
        : data.total
          ? `${data.total} ${data.total === 1 ? 'result' : 'results'}`
          : 'No results'

  return (
    <div className="search-palette" data-loading={loading || undefined}>
      <search className="search-palette-field">
        <Icon name="search" />
        <input
          type="search"
          role="combobox"
          aria-label="Search pages, notes, and projects"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optionId(active) : undefined}
          placeholder="Search…"
          autoComplete="off"
          spellCheck={false}
          maxLength={200}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <kbd>{shortcut}</kbd>
      </search>

      {data && !data.query && results.length > 0 && (
        <p className="search-palette-caption">Recent</p>
      )}
      <div
        id={listId}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- native select cannot hold rich options
        role="listbox"
        aria-label={data?.query ? 'Search results' : 'Recent pages'}
        className="search-palette-list"
        lang="id"
      >
        {results.map(({ id, url, title, label, snippet, description }, index) => (
          <Link
            key={id}
            id={optionId(index)}
            href={url}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- options stay real links
            role="option"
            aria-selected={index === active}
            tabIndex={-1}
            className="search-palette-option"
            onMouseMove={() => setActive(index)}
            onClick={onClose}
          >
            <span className="search-palette-label" lang="en">
              {label}
            </span>
            <span className="search-palette-text">
              <span className="search-palette-title">
                <Highlight text={title} query={data?.query ?? ''} />
              </span>
              {(snippet || description) && (
                <span className="search-palette-snippet">
                  <Highlight text={snippet || description} query={data?.query ?? ''} />
                </span>
              )}
            </span>
            <Icon name="enter" className="search-palette-enter" width={16} height={16} />
          </Link>
        ))}
      </div>
      {data?.query && !data.total && (
        <p className="search-palette-empty">
          Nothing matches “{data.query}”. Try fewer or different words.
        </p>
      )}

      <footer className="search-palette-footer" lang="en">
        <span className="search-palette-keys" aria-hidden="true">
          <kbd>↑</kbd>
          <kbd>↓</kbd> choose <kbd>↵</kbd> open <kbd>esc</kbd> close
        </span>
        <output aria-live="polite">{status}</output>
        {data?.query && data.total > results.length && (
          <Link href={`/search?q=${encodeURIComponent(data.query)}`} onClick={onClose}>
            All {data.total} results
          </Link>
        )}
      </footer>
    </div>
  )
}
