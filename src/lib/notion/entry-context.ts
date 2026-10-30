import 'server-only'

import { isEntryOrConfiguredPage } from './index/lookup'
import { getSitePages } from './index/site'
import { loadNotionPage } from './pages'
import { getBlockValue, resolveDefaultImageUrl } from 'notion-utils'
import { getSvgPageAsset } from './svg-media'

// Only pages under an article or project have context.
export async function getEntryContext(pageId: string) {
  if (await isEntryOrConfiguredPage(pageId)) return
  const pages = await getSitePages()
  const byId = new Map(pages.map((page) => [page.id, page]))
  const page = byId.get(pageId)
  const parent = page?.parentId ? byId.get(page.parentId) : undefined
  const visited = new Set([pageId])
  let entry = parent
  while (entry && !visited.has(entry.id)) {
    if (entry.kind === 'article' || entry.kind === 'project') {
      const recordMap = await loadNotionPage(entry.id)
      const block = recordMap && getBlockValue(recordMap.block[entry.id])
      const cover =
        block &&
        resolveDefaultImageUrl(block.format?.page_cover, block, {
          signedUrls: recordMap?.signed_urls,
          isPublic: true,
        })
      const svg = recordMap && getSvgPageAsset(recordMap, entry.id)
      return {
        entry,
        parent: parent!,
        cover,
        coverPath: svg?.path,
        coverPosition: block?.format?.page_cover_position,
      }
    }
    visited.add(entry.id)
    entry = entry.parentId ? byId.get(entry.parentId) : undefined
  }
}
