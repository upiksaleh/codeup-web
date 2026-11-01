'use client'

import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue, getPageTableOfContents, uuidToId } from 'notion-utils'
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './ui/icon'

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
  const [visibleIds, setVisibleIds] = useState<string[]>([])
  const selected = useRef<string | null>(null)

  useEffect(() => {
    if (!entries.length) return
    let frame = 0
    const fromHash = () => entries.find(({ id }) => `#${id}` === location.hash)?.id ?? null
    selected.current = fromHash()

    function update() {
      frame = 0
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
      // Highlight entries whose heading is on screen below the header.
      // A clicked heading always counts, even when the jump leaves it at the edge.
      const visible = headings.filter(
        ({ id, top }) => id === selected.current || (top >= offset - 24 && top < innerHeight),
      )
      setVisibleIds((ids) => {
        const next = (visible.length ? visible : [current]).map(({ id }) => id)
        return next.join() === ids.join() ? ids : next
      })
      setActiveId(selected.current ?? current.id)
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
    visibleIds,
    select(id: string) {
      selected.current = id
      setActiveId(id)
    },
  }
}

export type TableOfContentsState = ReturnType<typeof useTableOfContents>

const RAIL_STEP = 12
const BEND_HEIGHT = 8

type Rail = {
  path: string
  width: number
  height: number
  thumbs: { top: number; bottom: number }[]
}

// Measures the entries and draws one rail path that bends where the depth changes.
function measureRail(nav: HTMLElement, depths: number[]): Rail | null {
  const items = [...nav.querySelectorAll<HTMLElement>('.notion-table-of-contents-item')]
  if (!items.length) return null
  let path = ''
  const thumbs = items.map((item, index) => {
    const top = item.offsetTop
    const bottom = top + item.offsetHeight
    const x = depths[index]! * RAIL_STEP + 1
    const previous = depths[index - 1]
    if (previous === undefined) path += `M${x} ${top}`
    else if (previous !== depths[index]) path += `L${x} ${top + BEND_HEIGHT}`
    path += `V${bottom}`
    return { top, bottom }
  })
  return { path, width: Math.max(...depths) * RAIL_STEP + 2, height: nav.scrollHeight, thumbs }
}

export function TableOfContents({ toc }: { toc: TableOfContentsState }) {
  const minLevel = Math.min(...toc.entries.map(({ indentLevel }) => indentLevel))
  const depths = toc.entries.map(({ indentLevel }) => Math.min(indentLevel - minLevel, 2))
  const depthKey = depths.join()
  const navRef = useRef<HTMLElement>(null)
  const [rail, setRail] = useState<Rail | null>(null)

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const levels = depthKey.split(',').map(Number)
    const update = () => setRail(measureRail(nav, levels))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [depthKey])

  const visible = toc.entries.flatMap(({ id }, index) =>
    toc.visibleIds.includes(id) ? [index] : [],
  )
  const first = rail?.thumbs[visible[0] ?? -1]
  const last = rail?.thumbs[visible.at(-1) ?? -1]
  const thumb = first && last && { top: first.top, bottom: last.bottom }
  const mask = rail
    ? `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${rail.width}' height='${rail.height}'><path d='${rail.path}' fill='none' stroke='black' stroke-width='1'/></svg>`,
      )}")`
    : undefined

  return (
    <div className="notion-aside-table-of-contents">
      <div className="notion-aside-table-of-contents-header">
        <Icon name="contents" />
        On this page
      </div>
      <nav ref={navRef} className="notion-table-of-contents" aria-label="On this page" lang="id">
        {rail && (
          <>
            <svg className="toc-rail" aria-hidden="true" width={rail.width} height={rail.height}>
              <path d={rail.path} />
            </svg>
            <div
              className="toc-thumb"
              aria-hidden="true"
              style={{ width: rail.width, height: rail.height, maskImage: mask }}
            >
              {thumb && (
                <div
                  className="toc-thumb-fill"
                  style={{ top: thumb.top, height: thumb.bottom - thumb.top }}
                />
              )}
            </div>
          </>
        )}
        {toc.entries.map(({ id, text, indentLevel }, index) => {
          const active = toc.activeId === id
          const visibleEntry = toc.visibleIds.includes(id)
          return (
            <a
              key={id}
              href={`#${id}`}
              className={`notion-table-of-contents-item notion-table-of-contents-item-indent-level-${indentLevel}${visibleEntry ? ' toc-visible-item' : ''}`}
              style={{ '--depth': depths[index] } as CSSProperties}
              aria-current={active ? 'location' : undefined}
              onClick={(event) => {
                if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey)
                  toc.select(id)
              }}
            >
              <span className="notion-table-of-contents-item-body">{text}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
