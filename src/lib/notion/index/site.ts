import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Block, ExtendedRecordMap } from 'notion-types'
import {
  getBlockCollectionId,
  getBlockTitle,
  getBlockValue,
  getPageContentBlockIds,
} from 'notion-utils'
import { cache } from 'react'
import { siteConfig } from '@/site.config'
import { fetchBlocks } from '../client'
import { getPageInfo } from '../page-info'
import { cacheDuration, loadNotionPage } from '../pages'
import { findSitePageIds, isPageBlock } from '../record-map'
import { withPageUrls } from '../urls'

export function summarizePage(id: string, recordMap: ExtendedRecordMap) {
  const content = getPageContentBlockIds(recordMap, id)
    .map((blockId) => getBlockValue(recordMap.block[blockId]))
    // Child page titles belong to the child pages.
    .filter((block) => block?.alive && (block.id === id || !isPageBlock(block)))
    .map((block) => getBlockTitle(block!, recordMap))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { ...getPageInfo(id, recordMap), content }
}

// Entries are not block content; the page showing the collection lists them.
async function addCollectionEntries(recordMap: ExtendedRecordMap, block: Block) {
  const collectionId = getBlockCollectionId(block, recordMap)
  if (!collectionId) return []
  if (!recordMap.collection_query[collectionId]) {
    const source = await loadNotionPage(
      block.type === 'collection_view_page' ? block.id : block.parent_id,
    )
    if (source) {
      Object.assign(recordMap.collection, source.collection)
      Object.assign(recordMap.collection_view, source.collection_view)
      Object.assign(recordMap.collection_query, source.collection_query)
    }
  }
  return Object.values(recordMap.collection_query[collectionId] ?? {}).flatMap(
    (query) => query.collection_group_results?.blockIds ?? query.blockIds ?? [],
  )
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  )
}

// Walks block content level by level: 100 IDs per request, four requests at a time.
async function crawlSite() {
  const root = await loadNotionPage(siteConfig.rootNotionPageId)
  if (!root) throw new Error('The root Notion page is unavailable')
  const recordMap: ExtendedRecordMap = {
    ...root,
    block: { ...root.block },
    collection: { ...root.collection },
    collection_view: { ...root.collection_view },
    collection_query: { ...root.collection_query },
  }
  const visited = new Set<string>()
  let pending: string[] = [siteConfig.rootNotionPageId]

  while (pending.length) {
    for (const id of pending) visited.add(id)
    const next = new Set<string>()
    for (const group of chunk(chunk(pending, 100), 4)) {
      const blocks = Object.assign({}, ...(await Promise.all(group.map(fetchBlocks))))
      for (const id of group.flat()) {
        const block = getBlockValue<Block>(blocks[id])
        if (!block?.alive) continue
        recordMap.block[id] = blocks[id]
        const childIds = block.type.startsWith('collection_view')
          ? [...(block.content ?? []), ...(await addCollectionEntries(recordMap, block))]
          : (block.content ?? [])
        for (const childId of childIds) if (!visited.has(childId)) next.add(childId)
      }
    }
    pending = [...next]
  }
  return recordMap
}

async function collectSitePages() {
  const recordMap = await crawlSite()
  const pages = findSitePageIds(recordMap).map((id) => summarizePage(id, recordMap))
  return withPageUrls(pages).sort((a, b) => a.url.localeCompare(b.url))
}

export const siteIndexTag = 'notion:index'

const loadSitePages = unstable_cache(
  collectSitePages,
  ['notion-site-index', 'v1', siteConfig.rootNotionPageId],
  { tags: [siteIndexTag], revalidate: cacheDuration },
)

export const getSitePages = cache(() => loadSitePages())
