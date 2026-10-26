import 'server-only'

import { unstable_cache } from 'next/cache'
import { getBlockTitle, getBlockValue, getPageContentBlockIds } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { belongsToSite, loadNotionPage } from './load-page'
import { getPageInfo } from './page-info'
import { getPageUrl } from './page-url'

// Static routes and the studio page that a Notion slug must never shadow.
const reservedSlugs = new Set(['about', 'feed', 'search'])

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
        // Child page titles belong to those pages, not to this page's text.
        .filter(
          (block) =>
            block?.alive && (block.id === id || !/^(page|collection_view_page)$/.test(block.type)),
        )
        .map((block) => getBlockTitle(block!, recordMap))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      pages.push({ ...info, content: text })

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

  return withPageUrls(pages).sort((a, b) => a.url.localeCompare(b.url))
}

// Navigation paths win, then unique slugs; any other page keeps its stable ID path.
function withPageUrls<T extends { id: string; slug: string }>(pages: T[]) {
  const counts = new Map<string, number>()
  for (const { slug } of pages) if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  const navigationSegments = new Set(siteConfig.navigation.map(({ path }) => path.slice(1)))

  return pages.map((page) => {
    const navigation = siteConfig.navigation.find(({ pageId }) => pageId === page.id)
    const usesSlug =
      !navigation &&
      counts.get(page.slug) === 1 &&
      !reservedSlugs.has(page.slug) &&
      !navigationSegments.has(page.slug)

    return { ...page, url: usesSlug ? `/${page.slug}` : getPageUrl(page.id) }
  })
}

export const getSitePages = unstable_cache(
  collectSitePages,
  ['site-pages', siteConfig.rootNotionPageId],
  {
    revalidate: 300,
  },
)

export function isReservedSlug(segment: string) {
  return reservedSlugs.has(segment)
}

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
