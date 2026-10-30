import 'server-only'

import { unstable_cache } from 'next/cache'
import { findSitePageIds } from './record-map'
import { loadNotionPage, notionPageTag } from './pages'
import { readImage } from './image-previews'
import { getSvgCover } from './svg-cover'

export async function loadSvgCover(pageId: string, filename: string) {
  const recordMap = await loadNotionPage(pageId)
  if (!recordMap || !findSitePageIds(recordMap).includes(pageId)) return
  const cover = getSvgCover(recordMap, pageId)
  if (!cover || cover.path.split('/').at(-1) !== filename) return

  // Validate visibility before accessing cached bytes, including on conditional requests.
  const encoded = await unstable_cache(
    async () => (await readImage(cover.source, /^image\/svg\+xml(?:;|$)/i)).toString('base64'),
    ['svg-cover', 'v1', pageId, cover.source],
    { tags: [notionPageTag(pageId)], revalidate: 86_400 },
  )()
  return Buffer.from(encoded, 'base64')
}
