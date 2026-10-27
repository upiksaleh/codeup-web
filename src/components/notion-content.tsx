'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { useEffect, useMemo, type ReactNode } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { useSiteTheme } from '@/lib/theme'
import { normalizePageId } from '@/lib/notion/page-id'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'
import { NotionImage } from './notion-image'
import { MobileTableOfContents } from './mobile-table-of-contents'
import { TableOfContents, useTableOfContents } from './table-of-contents'
import { NotionCollection, type NotionCollectionProps } from './notion-collection'
import { attachPointerTrail } from './pointer-trail'
import { usePointerEffects } from './use-pointer-effects'

const NotionCode = dynamic(() => import('./notion-code').then((module) => module.NotionCode))

type DateValueProps = {
  data?: [string, [string, { start_date?: string }][]?][]
  schema?: { name?: string }
  pageHeader?: boolean
}

// Article headers show the Published date in full, like "April 4, 2023".
function propertyDateValue(
  { data, schema, pageHeader }: DateValueProps,
  fallback: () => ReactNode,
) {
  const start = data?.[0]?.[1]?.[0]?.[1]?.start_date
  if (!pageHeader || schema?.name?.toLowerCase() !== 'published' || !start) return fallback()

  const date = new Date(`${start.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return fallback()

  return (
    <time dateTime={start}>
      {date.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
}

export function NotionContent({
  recordMap,
  pageId,
  pageUrls,
  isHome,
  isArticle,
  pageHeader,
  pageCover,
  pageProperties,
}: {
  recordMap: ExtendedRecordMap
  pageId: string
  pageUrls: Record<string, string>
  isHome: boolean
  isArticle: boolean
  pageHeader: ReactNode
  pageCover?: ReactNode
  pageProperties?: ReactNode
}) {
  const theme = useSiteTheme()
  const toc = useTableOfContents(recordMap, pageId, !isHome)
  usePointerEffects()
  // The renderer shows a database page's properties through Collection; a page with its own
  // property view replaces that generic table.
  const PageCollection = useMemo(
    () =>
      function PageCollection(props: NotionCollectionProps) {
        return pageProperties && props.block.id === pageId ? (
          pageProperties
        ) : (
          <NotionCollection {...props} />
        )
      },
    [pageId, pageProperties],
  )
  useEffect(() => {
    // The renderer owns the cover markup, so the trail canvas is added after it renders.
    const cover = document.querySelector('.content-page .notion-page-cover-wrapper')
    if (!cover) return
    const canvas = document.createElement('canvas')
    canvas.className = 'pointer-trail'
    canvas.setAttribute('aria-hidden', 'true')
    cover.append(canvas)
    const detach = attachPointerTrail(canvas)
    return () => {
      detach?.()
      canvas.remove()
    }
  }, [pageId])
  return (
    <>
      <NotionRenderer
        recordMap={recordMap}
        blockId={pageId}
        rootPageId={siteConfig.rootNotionPageId}
        rootDomain={siteConfig.domain}
        mapPageUrl={(id) => pageUrls[normalizePageId(id) ?? ''] ?? getPageUrl(id)}
        fullPage={!isHome}
        showCollectionViewDropdown={!isHome}
        className={isHome ? 'home-page' : isArticle ? 'content-page article-page' : 'content-page'}
        pageHeader={pageHeader}
        pageCover={pageCover}
        showTableOfContents={false}
        pageAside={toc.entries.length ? <TableOfContents toc={toc} /> : undefined}
        disableHeader
        darkMode={theme === 'dark'}
        previewImages
        components={{
          nextLink: Link,
          nextImage: NotionImage,
          Collection: PageCollection,
          Code: NotionCode,
          propertyDateValue,
        }}
      />
      {!!toc.entries.length && <MobileTableOfContents key={pageId} toc={toc} />}
    </>
  )
}
