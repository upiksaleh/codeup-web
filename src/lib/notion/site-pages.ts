import 'server-only'

import { unstable_cache } from 'next/cache'
import type { ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getBlockValue, getPageContentBlockIds } from 'notion-utils'
import { cache } from 'react'
import { siteConfig } from '@/site.config'
import {
  belongsToSite,
  cacheDuration,
  fetchValidatedPage,
  getLastEditedTimes,
  notionPageTag,
} from './load-page'
import { getPageInfo } from './page-info'
import { getPageUrl } from './page-url'
import { withPageUrls } from './page-paths'

function summarizePage(id: string, recordMap: ExtendedRecordMap) {
  const content = getPageContentBlockIds(recordMap, id)
    .map((blockId) => getBlockValue(recordMap.block[blockId]))
    // Child page titles belong to those pages, not to this page's text.
    .filter(
      (block) =>
        block?.alive && (block.id === id || !/^(page|collection_view_page)$/.test(block.type)),
    )
    .map((block) => getBlockTitle(block!, recordMap))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  const childIds = Object.values(recordMap.block)
    .map((entry) => getBlockValue(entry))
    .filter(
      (block) =>
        block?.alive &&
        block.id !== id &&
        (block.type === 'page' || block.type === 'collection_view_page') &&
        belongsToSite(recordMap, block),
    )
    .map((block) => block!.id)

  return { ...getPageInfo(id, recordMap), content, childIds }
}

export type PageSummary = ReturnType<typeof summarizePage>

// A small entry per page, so the index never holds full record maps and a change
// refetches only the pages that changed. It shares its tag with the page's record map.
export function loadPageSummary(id: string) {
  const load = unstable_cache(
    async () => {
      const recordMap = await fetchValidatedPage(id)
      return recordMap ? summarizePage(id, recordMap) : null
    },
    ['notion-page-summary', 'v1', siteConfig.rootNotionPageId, id],
    { tags: [notionPageTag(id)], revalidate: cacheDuration },
  )
  return load()
}

async function collectSitePages() {
  const visited = new Set<string>()
  const pages: PageSummary[] = []
  let pending: string[] = [siteConfig.rootNotionPageId]

  while (pending.length) {
    for (const id of pending) visited.add(id)
    const next = new Set<string>()

    // Four at a time, so a cold cache does not burst requests to Notion.
    for (let start = 0; start < pending.length; start += 4) {
      const summaries = await Promise.all(pending.slice(start, start + 4).map(loadPageSummary))
      for (const summary of summaries) {
        if (!summary) continue
        pages.push(summary)
        for (const childId of summary.childIds) if (!visited.has(childId)) next.add(childId)
      }
    }
    pending = [...next]
  }

  return withPageUrls(pages).sort((a, b) => a.url.localeCompare(b.url))
}

export const getSitePages = cache(collectSitePages)

export async function getSitePageUrl(pageId: string) {
  return (await getSitePages()).find(({ id }) => id === pageId)?.url ?? getPageUrl(pageId)
}

// URLs for the pages a record map links to, so client-side links use the same paths.
export async function getSitePageUrls(pageIds: string[]) {
  const ids = new Set(pageIds)
  return Object.fromEntries(
    (await getSitePages()).filter(({ id }) => ids.has(id)).map(({ id, url }) => [id, url]),
  )
}

// Database items can be added without editing their parent, so pages that hold a site
// gallery are compared by their children as well as their edit time.
const galleryPageIds = [siteConfig.rootNotionPageId, siteConfig.projectsDatabaseId]

export async function findChangedPageIds() {
  const pages = await getSitePages()
  const [editedTimes, galleries] = await Promise.all([
    getLastEditedTimes(pages.map(({ id }) => id)),
    Promise.all(galleryPageIds.map(fetchValidatedPage)),
  ])
  const changed = new Set(
    pages.filter(({ id, lastEdited }) => editedTimes.get(id) !== lastEdited).map(({ id }) => id),
  )

  for (const [index, id] of galleryPageIds.entries()) {
    const cached = pages.find((page) => page.id === id)
    const recordMap = galleries[index]
    const fresh = recordMap && summarizePage(id, recordMap)
    const childIds = (summary?: { childIds: string[] } | null) =>
      [...(summary?.childIds ?? [])].sort().join()
    if (childIds(cached) !== childIds(fresh)) changed.add(id)
  }

  return [...changed]
}
