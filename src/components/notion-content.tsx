'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import type { ComponentProps, ReactNode } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { useSiteTheme } from '@/lib/theme'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'
import { NotionImage } from './notion-image'

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
  return (
    <div className="notion-collection-section">
      <Collection {...props} />
    </div>
  )
}

export function NotionContent({
  recordMap,
  pageId,
  isHome,
  isBlogPost,
  pageHeader,
  pageCover,
  pageFooter,
}: {
  recordMap: ExtendedRecordMap
  pageId: string
  isHome: boolean
  isBlogPost: boolean
  pageHeader: ReactNode
  pageCover?: ReactNode
  pageFooter?: ReactNode
}) {
  const theme = useSiteTheme()
  return (
    <NotionRenderer
      recordMap={recordMap}
      blockId={pageId}
      rootPageId={siteConfig.rootNotionPageId}
      rootDomain={siteConfig.domain}
      mapPageUrl={getPageUrl}
      fullPage={!isHome}
      showCollectionViewDropdown={!isHome}
      className={isHome ? 'home-page' : isBlogPost ? 'content-page blog-page' : 'content-page'}
      pageHeader={pageHeader}
      pageCover={pageCover}
      pageFooter={pageFooter}
      showTableOfContents={!isHome}
      minTableOfContentsItems={3}
      tableOfContentsTitle="Table of contents"
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
  )
}
