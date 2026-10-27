'use client'

import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue, getPageTableOfContents, uuidToId } from 'notion-utils'
import { useEffect, useMemo, useRef, useState } from 'react'

export function useTableOfContents(recordMap: ExtendedRecordMap, pageId: string, enabled: boolean) {
  const entries = useMemo(() => {
    const page = getBlockValue(recordMap.block[pageId])
    if (!enabled || page?.type !== 'page' || page.format?.page_full_width) return []
    const headings = getPageTableOfContents(page, recordMap)
    return headings.length >= 3
      ? headings.map((entry) => ({ ...entry, id: uuidToId(entry.id) }))
      : []
  }, [recordMap, pageId, enabled])
  const [activeId, setActiveId] = useState('')
  const selected = useRef<string | null>(null)

  useEffect(() => {
    if (!entries.length) return
    let frame = 0
    const fromHash = () => entries.find(({ id }) => `#${id}` === location.hash)?.id ?? null
    selected.current = fromHash()

    function update() {
      frame = 0
      if (selected.current) {
        setActiveId(selected.current)
        return
      }
      const headings = entries.flatMap(({ id }) => {
        const element = document.getElementById(id)
        return element ? [{ id, top: element.getBoundingClientRect().top }] : []
      })
      if (!headings.length) return
      const atEnd =
        scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 2
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 96
      const current = atEnd
        ? headings.at(-1)!
        : (headings.findLast(({ top }) => top <= offset + 24) ?? headings[0]!)
      setActiveId(current.id)
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    function resume() {
      selected.current = null
      schedule()
    }
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable], dialog')
      )
        return
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))
        resume()
    }
    function onHashChange() {
      selected.current = fromHash()
      schedule()
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target === document.documentElement) resume()
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', resume)
    window.addEventListener('wheel', resume, { passive: true })
    window.addEventListener('touchmove', resume, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', resume)
      window.removeEventListener('wheel', resume)
      window.removeEventListener('touchmove', resume)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [entries])

  return {
    entries,
    activeId: entries.some(({ id }) => id === activeId) ? activeId : entries[0]?.id,
    select(id: string) {
      selected.current = id
      setActiveId(id)
    },
  }
}

export type TableOfContentsState = ReturnType<typeof useTableOfContents>

export function TableOfContents({ toc }: { toc: TableOfContentsState }) {
  return (
    <div className="notion-aside-table-of-contents">
      <div className="notion-aside-table-of-contents-header">Table of contents</div>
      <nav className="notion-table-of-contents" aria-label="Table of contents" lang="id">
        {toc.entries.map(({ id, text, indentLevel }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`notion-table-of-contents-item notion-table-of-contents-item-indent-level-${indentLevel}${toc.activeId === id ? ' notion-table-of-contents-active-item' : ''}`}
            aria-current={toc.activeId === id ? 'location' : undefined}
            onClick={(event) => {
              if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey)
                toc.select(id)
            }}
          >
            <span
              className="notion-table-of-contents-item-body"
              style={{ display: 'inline-block', marginLeft: indentLevel * 16 }}
            >
              {text}
            </span>
          </a>
        ))}
      </nav>
    </div>
  )
}
