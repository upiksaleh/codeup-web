'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { getBlockValue } from 'notion-utils'
import { NotionContextProvider, NotionRenderer, Text } from 'react-notion-x'
import type { PagePreview } from '@/lib/notion/page-preview'
import type { LinkMetadata } from '@/lib/link-metadata'
import { useSiteTheme } from '@/lib/theme'
import { siteConfig } from '@/site.config'
import { NotionImage } from './notion-image'

const NotionCode = dynamic(() => import('./notion-code').then((module) => module.NotionCode))

function PreviewSkeleton({ url }: { url?: string }) {
  return (
    <output className="preview-skeleton" aria-label="Loading preview" aria-busy="true">
      <div aria-hidden="true">
        {url && <div className="external-link-preview-image preview-skeleton-shape" />}
        <div className="notion-page-preview-title preview-skeleton-title preview-skeleton-shape" />
        <div className="external-link-preview-description preview-skeleton-text">
          <div className="preview-skeleton-line preview-skeleton-shape" />
          <div className="preview-skeleton-line preview-skeleton-shape" />
          <div className="preview-skeleton-line preview-skeleton-shape" />
        </div>
        {url ? (
          <div className="notion-page-preview-path" title={url}>
            {url}
          </div>
        ) : (
          <div className="preview-skeleton-content preview-skeleton-shape" />
        )}
      </div>
    </output>
  )
}

function LoadPreview({ pageId, url }: { pageId: string; url?: string }) {
  const [preview, setPreview] = useState<PagePreview | LinkMetadata | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const endpoint = url
          ? `/api/link-preview?${new URLSearchParams({ pageId, url })}`
          : `/api/notion-preview?id=${encodeURIComponent(pageId)}`
        const response = await fetch(endpoint, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Preview unavailable')
        const result: PagePreview | LinkMetadata = await response.json()
        if (!controller.signal.aborted) setPreview(result)
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => controller.abort()
  }, [pageId, url])

  if (failed) return <output className="notion-page-preview-status">Preview unavailable</output>
  if (!preview) return <PreviewSkeleton url={url} />
  if ('recordMap' in preview) return <PreviewContent preview={preview} />
  return (
    <div className="external-link-preview">
      {preview.image && (
        <Image
          className="external-link-preview-image"
          src={preview.image}
          alt=""
          width={600}
          height={320}
          unoptimized
        />
      )}
      <div className="notion-page-preview-title">{preview.title}</div>
      {preview.description && (
        <p className="external-link-preview-description">{preview.description}</p>
      )}
      <div className="notion-page-preview-path" title={preview.url}>
        {preview.url}
      </div>
    </div>
  )
}

function PreviewContent({ preview }: { preview: PagePreview }) {
  const theme = useSiteTheme()
  const page = getBlockValue(preview.recordMap.block[preview.pageId])!
  return (
    <NotionContextProvider recordMap={preview.recordMap} rootPageId={siteConfig.rootNotionPageId}>
      <div className="notion-page-preview-title">
        <Text block={page} value={page.properties?.title} />
      </div>
      <div className="notion-page-preview-content" inert aria-hidden="true">
        {preview.blockIds.map((blockId) => (
          <NotionRenderer
            key={blockId}
            blockId={blockId}
            recordMap={preview.recordMap}
            rootPageId={siteConfig.rootNotionPageId}
            fullPage={false}
            darkMode={theme === 'dark'}
            isImageZoomable={false}
            disableHeader
            components={{ nextImage: NotionImage, Code: NotionCode }}
          />
        ))}
      </div>
    </NotionContextProvider>
  )
}

function getLinkKey(link: HTMLAnchorElement) {
  return link.origin === location.origin ? link.pathname : link.href
}

export function LinkPreviews({
  targets,
  pageId,
}: {
  targets: Record<string, string>
  pageId: string
}) {
  const id = useId()
  const card = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<{ link: HTMLAnchorElement; path: string } | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let current: HTMLAnchorElement | null = null
    let previousDescription: string | null = null

    function cancelTimer() {
      clearTimeout(timer)
    }

    function close() {
      cancelTimer()
      if (current) {
        if (previousDescription === null) current.removeAttribute('aria-describedby')
        else current.setAttribute('aria-describedby', previousDescription)
      }
      current = null
      setActive(null)
    }

    function findLink(target: EventTarget | null) {
      if (!(target instanceof Element)) return null
      const link = target.closest<HTMLAnchorElement>(
        '.notion a.notion-link, .notion a.notion-page-link',
      )
      if (!link || link.closest('.notion-page-preview')) return null
      if (link.origin === location.origin ? !targets[link.pathname] : link.protocol !== 'https:')
        return null
      return link
    }

    function open(link: HTMLAnchorElement, delay: number) {
      cancelTimer()
      if (current === link) return
      close()
      const show = () => {
        current = link
        previousDescription = link.getAttribute('aria-describedby')
        link.setAttribute('aria-describedby', [previousDescription, id].filter(Boolean).join(' '))
        setActive({ link, path: getLinkKey(link) })
      }
      if (delay) timer = setTimeout(show, delay)
      else show()
    }

    function onOver(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      if (event.target instanceof Node && card.current?.contains(event.target)) {
        cancelTimer()
        return
      }
      const link = findLink(event.target)
      if (link && !(event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) {
        open(link, 350)
      }
    }

    function onOut(event: PointerEvent) {
      if (current && document.activeElement === current) return
      const link = findLink(event.target)
      const inCard = event.target instanceof Node && card.current?.contains(event.target)
      if (!link && !inCard) return
      if (event.relatedTarget instanceof Node) {
        if (link?.contains(event.relatedTarget) || card.current?.contains(event.relatedTarget))
          return
        if (current?.contains(event.relatedTarget)) return
      }
      cancelTimer()
      timer = setTimeout(close, 150)
    }

    function onFocus(event: FocusEvent) {
      const link = findLink(event.target)
      if (link) open(link, 0)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    function onScroll(event: Event) {
      if (event.target instanceof Node && card.current?.contains(event.target)) return
      if (current && document.activeElement === current) {
        const rect = current.getBoundingClientRect()
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          setActive({ link: current, path: getLinkKey(current) })
          return
        }
      }
      close()
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', close)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', close)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    return () => {
      close()
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', close)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', close)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
  }, [id, targets])

  useLayoutEffect(() => {
    if (!active || !card.current) return
    function placeCard() {
      if (!active || !card.current) return
      const link = active.link.getBoundingClientRect()
      const preview = card.current.getBoundingClientRect()
      const below = link.bottom + 8
      setPosition({
        left: Math.max(12, Math.min(link.left, window.innerWidth - preview.width - 12)),
        top: Math.max(
          12,
          below + preview.height <= window.innerHeight - 12 ? below : link.top - preview.height - 8,
        ),
      })
    }
    placeCard()
    const observer = new ResizeObserver(placeCard)
    observer.observe(card.current)
    return () => observer.disconnect()
  }, [active])

  if (!active) return null
  return createPortal(
    <div ref={card} id={id} role="tooltip" className="notion-page-preview" style={position}>
      <LoadPreview
        key={active.path}
        pageId={targets[active.path] ?? pageId}
        url={targets[active.path] ? undefined : active.path}
      />
    </div>,
    document.body,
  )
}
