'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((module) => module.Collection),
)

export function NotionContent({ recordMap }: { recordMap: ExtendedRecordMap }) {
  return (
    <NotionRenderer
      recordMap={recordMap}
      rootPageId={siteConfig.rootNotionPageId}
      rootDomain={siteConfig.domain}
      mapPageUrl={getPageUrl}
      fullPage
      disableHeader
      darkMode={false}
      isImageZoomable={false}
      components={{ nextLink: Link, Collection }}
    />
  )
}
