import 'server-only'

import { unstable_cache } from 'next/cache'
import { findSitePageIds } from './record-map'
import { loadNotionPage, notionPageTag } from './pages'
import { readImage } from './image-previews'
import { getSvgPageAsset } from './svg-media'

export async function loadSvgMedia(pageId: string, filename: string) {
  const recordMap = await loadNotionPage(pageId)
  if (!recordMap || !findSitePageIds(recordMap).includes(pageId)) return
  const kind = filename.startsWith('icon-') ? 'icon' : 'cover'
  const asset = getSvgPageAsset(recordMap, pageId, kind)
  if (!asset || asset.path.split('/').at(-1) !== filename) return

  // Validate visibility before accessing cached bytes, including on conditional requests.
  const encoded = await unstable_cache(
    async () => (await readImage(asset.source, /^image\/svg\+xml(?:;|$)/i)).toString('base64'),
    ['svg-media', 'v1', pageId, asset.source],
    { tags: [notionPageTag(pageId)], revalidate: 86_400 },
  )()
  return Buffer.from(encoded, 'base64')
}
