import 'server-only'

import { siteConfig } from '@/site.config'
import { fetchLastEditedTimes } from '../client'
import { fetchSitePage } from '../pages'
import { findSitePageIds } from '../record-map'
import { getSitePages } from './site'

// Gallery pages also change when a database item is added; removed items fail the edited-time check.
const galleryPageIds = [
  siteConfig.rootNotionPageId,
  siteConfig.articlesDatabaseId,
  siteConfig.projectsDatabaseId,
]

export async function findChangedPageIds() {
  const pages = await getSitePages()
  const [editedTimes, galleries] = await Promise.all([
    fetchLastEditedTimes(pages.map(({ id }) => id)),
    Promise.all(galleryPageIds.map(fetchSitePage)),
  ])
  const changed = new Set(
    pages.filter(({ id, lastEdited }) => editedTimes.get(id) !== lastEdited).map(({ id }) => id),
  )

  const indexed = new Set(pages.map(({ id }) => id))
  for (const [index, id] of galleryPageIds.entries()) {
    const recordMap = galleries[index]
    if (!recordMap || findSitePageIds(recordMap).some((childId) => !indexed.has(childId))) {
      changed.add(id)
    }
  }
  return [...changed]
}
