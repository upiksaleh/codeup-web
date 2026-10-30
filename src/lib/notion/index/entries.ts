import 'server-only'

import { cache } from 'react'
import { entryDatabaseIds } from '../entry-gallery'
import { getPageInfo } from '../page-info'
import { loadNotionPage } from '../pages'
import { findSitePageIds } from '../record-map'
import { withPageUrls } from '../urls'

// Articles and projects from their cached database pages; each database is a whole URL namespace.
export const getEntryPages = cache(async () => {
  const entries = await Promise.all(
    Object.entries(entryDatabaseIds).map(async ([kind, pageId]) => {
      const recordMap = await loadNotionPage(pageId)
      if (!recordMap) throw new Error(`The ${kind} database page is unavailable`)
      return findSitePageIds(recordMap)
        .map((id) => getPageInfo(id, recordMap))
        .filter((page) => page.kind === kind)
    }),
  )
  return withPageUrls(entries.flat())
})
