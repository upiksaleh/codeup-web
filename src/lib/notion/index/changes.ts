import 'server-only'

import { siteConfig } from '@/site.config'
import { fetchLastEditedTimes } from '../client'
import { fetchSitePage, getCachedEditedTime } from '../pages'
import { findSitePageIds } from '../record-map'
import { getSitePages } from './site'

// Gallery pages also change when a database item is added; removed items fail the edited-time check.
const galleryPageIds = [
  siteConfig.rootNotionPageId,
  siteConfig.articlesDatabaseId,
  siteConfig.projectsDatabaseId,
]

// Returns pages whose cache may be stale and whether the site index is stale too.
export async function findChangedPages() {
  const pages = await getSitePages()
  const [editedTimes, cachedTimes, galleries] = await Promise.all([
    fetchLastEditedTimes(pages.map(({ id }) => id)),
    Promise.all(pages.map(({ id }) => getCachedEditedTime(id))),
    Promise.all(galleryPageIds.map(fetchSitePage)),
  ])
  const changed = new Set<string>()
  let indexChanged = false
  // The index and each page cache refresh separately; either may predate the edit.
  // A missing marker is unknown, so the page is expired until a read fills it again.
  for (const [index, { id, lastEdited }] of pages.entries()) {
    const edited = editedTimes.get(id)
    if (edited !== lastEdited) indexChanged = true
    if (edited !== lastEdited || edited !== (cachedTimes[index] ?? undefined)) changed.add(id)
  }

  const indexed = new Set(pages.map(({ id }) => id))
  for (const [index, id] of galleryPageIds.entries()) {
    const recordMap = galleries[index]
    if (!recordMap || findSitePageIds(recordMap).some((childId) => !indexed.has(childId))) {
      changed.add(id)
      indexChanged = true
    }
  }
  return { pageIds: [...changed], indexChanged }
}
