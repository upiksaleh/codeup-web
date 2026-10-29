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

export const loadNotionPage = cache(async (pageId: string) => {
  const id = normalizePageId(pageId)
  if (!id) return undefined
  const load = unstable_cache(
    () => fetchSitePage(id),
    ['notion-page', 'v3', siteConfig.rootNotionPageId, id],
    { tags: [notionPageTag(id)], revalidate: cacheDuration },
  )
  return (await load()) ?? undefined
})
