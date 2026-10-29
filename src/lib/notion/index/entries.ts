import 'server-only'

import { cache } from 'react'
import { siteConfig } from '@/site.config'
import { getPageInfo } from '../page-info'
import { loadNotionPage } from '../pages'
import { findSitePageIds } from '../record-map'
import { withPageUrls } from '../urls'

// Articles and projects from the cached root record map; each database is a whole URL namespace.
export const getEntryPages = cache(async () => {
  const recordMap = await loadNotionPage(siteConfig.rootNotionPageId)
  if (!recordMap) throw new Error('The root Notion page is unavailable')
  const entries = findSitePageIds(recordMap)
    .map((id) => getPageInfo(id, recordMap))
    .filter(({ kind }) => kind === 'article' || kind === 'project')
  return withPageUrls(entries)
})
