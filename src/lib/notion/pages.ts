import 'server-only'

import { unstable_cache } from 'next/cache'
import { getBlockValue } from 'notion-utils'
import { cache } from 'react'
import { siteConfig } from '@/site.config'
import { fetchPage } from './client'
import { belongsToSite, isPageBlock, prepareRecordMap } from './record-map'
import { normalizePageId } from './urls'

export const notionPageTag = (pageId: string) => `notion:${pageId}`

// Upper bound in case the scheduled /api/revalidate stops running.
export const cacheDuration = 86_400

// Uncached; for callers with their own cache entry.
export async function fetchSitePage(pageId: string) {
  const recordMap = await fetchPage(pageId)
  if (!recordMap) return null
  await prepareRecordMap(recordMap)
  const page = getBlockValue(recordMap.block[pageId])
  return page?.alive && isPageBlock(page) && belongsToSite(recordMap, page) ? recordMap : null
}

const loadCachedPage = (id: string) =>
  unstable_cache(() => fetchSitePage(id), ['notion-page', 'v4', siteConfig.rootNotionPageId, id], {
    tags: [notionPageTag(id)],
    revalidate: cacheDuration,
  })()

// Small entry under the page tag holding the edit time of the cached record map, so
// /api/revalidate can detect stale pages without reading record maps. Next keys
// unstable_cache by the callback's source; a bound native function prints the same
// text in every bundle, so the endpoint and page renders address one entry.
const editedTimeMarker = (id: string, editedTime: number | null) =>
  unstable_cache(
    Promise.resolve.bind(Promise, editedTime) as () => Promise<number | null>,
    ['notion-page-edited', 'v2', siteConfig.rootNotionPageId, id],
    { tags: [notionPageTag(id)], revalidate: cacheDuration },
  )()

export const loadNotionPage = cache(async (pageId: string) => {
  const id = normalizePageId(pageId)
  if (!id) return undefined
  const recordMap = await loadCachedPage(id)
  if (!recordMap) return undefined
  // Filled outside the record map cache; a nested unstable_cache skips its lookup.
  await editedTimeMarker(id, getBlockValue(recordMap.block[id])?.last_edited_time ?? null)
  return recordMap
})

// Null when no page read has filled the marker yet; never requests Notion.
export const getCachedEditedTime = (id: string) => editedTimeMarker(id, null)
