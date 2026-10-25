import 'server-only'

import { unstable_cache } from 'next/cache'
import { getBlockTitle, getBlockValue, getPageContentBlockIds } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { belongsToSite, loadNotionPage } from './load-page'
import { getPageInfo } from './page-info'

async function collectSitePages() {
  const pending = new Set<string>([siteConfig.rootNotionPageId])
  const visited = new Set<string>()
  const pages = []

  while (pending.size) {
    const batch = [...pending].slice(0, 4)
    for (const id of batch) {
      pending.delete(id)
      visited.add(id)
    }

    const maps = await Promise.all(batch.map((id) => loadNotionPage(id)))

    for (const [index, recordMap] of maps.entries()) {
      if (!recordMap) continue
      const id = batch[index]
      const info = getPageInfo(id, recordMap)
      const text = getPageContentBlockIds(recordMap, id)
        .map((blockId) => getBlockValue(recordMap.block[blockId]))
        .filter((block) => block?.alive)
        .map((block) => getBlockTitle(block!, recordMap))
        .join(' ')

      pages.push({
        ...info,
        searchText: `${info.title} ${info.description} ${info.tags.join(' ')} ${text}`,
      })

      for (const entry of Object.values(recordMap.block)) {
        const block = getBlockValue(entry)
        if (
          block?.alive &&
          (block.type === 'page' || block.type === 'collection_view_page') &&
          !visited.has(block.id) &&
          belongsToSite(recordMap, block)
        ) {
          pending.add(block.id)
        }
      }
    }
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url))
}

export const getSitePages = unstable_cache(
  collectSitePages,
  ['site-pages', siteConfig.rootNotionPageId],
  {
    revalidate: 300,
  },
)
