'use client'

import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'
import { NotionRenderer } from 'react-notion-x'
import { normalizePageId } from '@/lib/notion/urls'
import { getDefaultPageUrl } from '@/lib/notion/urls'
import { useSiteTheme } from '@/lib/theme'
import { siteConfig } from '@/site.config'
import { NotionCollection, type NotionCollectionProps } from './notion-collection'
import { NotionImage } from './notion-image'
import { propertyDateValue } from './property-date-value'

export type EntryGalleryData = {
  recordMap: ExtendedRecordMap
  blockId: string
  collectionId: string
  viewId: string
}

function ListingCollection(props: NotionCollectionProps) {
  return <NotionCollection {...props} titleLines={3} />
}

export function EntryGallery({
  gallery: { recordMap, blockId, collectionId, viewId },
  pageIds,
  pageUrls,
}: {
  gallery: EntryGalleryData
  pageIds: string[]
  pageUrls: Record<string, string>
}) {
  const theme = useSiteTheme()
  const block = getBlockValue(recordMap.block[blockId])
  const view = getBlockValue(recordMap.collection_view[viewId])
  if (
    (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') ||
    view?.type !== 'gallery'
  )
    return null

  const listingView = {
    ...view,
    format: { ...view.format, inline_collection_first_load_limit: { limit: pageIds.length } },
  }

  // Keep the Notion gallery settings; the listing owns filtering and pagination.
  const galleryMap: ExtendedRecordMap = {
    ...recordMap,
    block: {
      ...recordMap.block,
      [blockId]: { role: 'reader', value: { ...block, view_ids: [viewId] } },
    },
    collection_view: {
      ...recordMap.collection_view,
      [viewId]: { role: 'reader', value: listingView },
    },
    collection_query: {
      [collectionId]: {
        [viewId]: {
          type: 'gallery',
          total: pageIds.length,
          blockIds: pageIds,
          aggregationResults: [],
          collection_group_results: { type: 'results', blockIds: pageIds, hasMore: false },
        },
      },
    },
  }

  return (
    <NotionRenderer
      recordMap={galleryMap}
      blockId={blockId}
      rootPageId={siteConfig.rootNotionPageId}
      rootDomain={siteConfig.domain}
      mapPageUrl={(id) => pageUrls[normalizePageId(id) ?? ''] ?? getDefaultPageUrl(id)}
      className="entry-listing-gallery"
      fullPage={false}
      darkMode={theme === 'dark'}
      previewImages
      disableHeader
      showCollectionViewDropdown={false}
      components={{
        nextLink: Link,
        nextImage: NotionImage,
        Collection: ListingCollection,
        propertyDateValue,
      }}
    />
  )
}
