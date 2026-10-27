'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId } from 'notion-utils'
import type { ComponentProps, ReactNode } from 'react'
import { NotionRenderer, useNotionContext } from 'react-notion-x'
import { useSiteTheme } from '@/lib/theme'
import { normalizePageId } from '@/lib/notion/page-id'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'
import { NotionImage } from './notion-image'
import { MobileTableOfContents } from './mobile-table-of-contents'
import { TableOfContents, useTableOfContents } from './table-of-contents'
import { useArticleCardTitles } from './use-article-card-titles'
import { usePointerEffects } from './use-pointer-effects'

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((module) => module.Collection),
)

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

function NotionCollection(props: ComponentProps<typeof Collection>) {
  const { recordMap } = useNotionContext()
  const isArticleCollection =
    getBlockCollectionId(props.block, recordMap) === siteConfig.articleCollectionId
  const ref = useArticleCardTitles(isArticleCollection)

  return (
    <div
      ref={ref}
      id={isArticleCollection ? 'articles' : undefined}
      className={`notion-collection-section${isArticleCollection ? ' article-collection' : ''}`}
    >
      <Collection {...props} />
    </div>
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
}: {
  recordMap: ExtendedRecordMap
  pageId: string
  pageUrls: Record<string, string>
  isHome: boolean
  isArticle: boolean
  pageHeader: ReactNode
  pageCover?: ReactNode
}) {
  const theme = useSiteTheme()
  const toc = useTableOfContents(recordMap, pageId, !isHome)
  usePointerEffects()
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
          Collection: NotionCollection,
          Code: NotionCode,
          propertyDateValue,
        }}
      />
      {!!toc.entries.length && <MobileTableOfContents key={pageId} toc={toc} />}
    </>
  )
}
