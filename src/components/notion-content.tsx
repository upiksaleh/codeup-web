'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { CodeBlock, ExtendedRecordMap } from 'notion-types'
import { getBlockTitle } from 'notion-utils'
import type { ComponentProps, ReactNode } from 'react'
import { NotionRenderer, Text, useNotionContext } from 'react-notion-x'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((module) => module.Collection),
)

function NotionCollection(props: ComponentProps<typeof Collection>) {
  return (
    <div className="notion-collection-section">
      <Collection {...props} />
    </div>
  )
}

function NotionCode({ block }: { block: CodeBlock }) {
  const { recordMap } = useNotionContext()

  return (
    <figure className="notion-code-block">
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allows keyboard scrolling of long code lines. */}
      <pre className="notion-code" tabIndex={0} aria-label="Code block">
        <code>{getBlockTitle(block, recordMap)}</code>
      </pre>
      {block.properties.caption && (
        <figcaption className="notion-asset-caption">
          <Text value={block.properties.caption} block={block} />
        </figcaption>
      )}
    </figure>
  )
}

export function NotionContent({
  recordMap,
  pageId,
  isHome,
  pageHeader,
  pageCover,
}: {
  recordMap: ExtendedRecordMap
  pageId: string
  isHome: boolean
  pageHeader: ReactNode
  pageCover?: ReactNode
}) {
  return (
    <NotionRenderer
      recordMap={recordMap}
      blockId={pageId}
      rootPageId={siteConfig.rootNotionPageId}
      rootDomain={siteConfig.domain}
      mapPageUrl={getPageUrl}
      fullPage={!isHome}
      showCollectionViewDropdown={!isHome}
      className={isHome ? 'home-page' : 'content-page'}
      pageHeader={pageHeader}
      pageCover={pageCover}
      disableHeader
      darkMode={false}
      isImageZoomable={false}
      components={{ nextLink: Link, Collection: NotionCollection, Code: NotionCode }}
    />
  )
}
