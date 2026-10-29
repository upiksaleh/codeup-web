import 'server-only'

import { siteConfig } from '@/site.config'
import { fetchLastEditedTimes } from '../client'
import { fetchSitePage } from '../pages'
import { getSitePages, summarizePage } from './site'

// Gallery pages also change when a database item is added or removed.
const galleryPageIds = [siteConfig.rootNotionPageId, siteConfig.projectsDatabaseId]

export async function findChangedPageIds() {
  const pages = await getSitePages()
  const [editedTimes, galleries] = await Promise.all([
    fetchLastEditedTimes(pages.map(({ id }) => id)),
    Promise.all(galleryPageIds.map(fetchSitePage)),
  ])
  const changed = new Set(
    pages.filter(({ id, lastEdited }) => editedTimes.get(id) !== lastEdited).map(({ id }) => id),
  )

  const childIds = (summary?: { childIds: string[] } | null) =>
    [...(summary?.childIds ?? [])].sort().join()
  for (const [index, id] of galleryPageIds.entries()) {
    const recordMap = galleries[index]
    const fresh = recordMap && summarizePage(id, recordMap)
    if (childIds(pages.find((page) => page.id === id)) !== childIds(fresh)) changed.add(id)
  }
  return [...changed]
}
