import { createHash } from 'node:crypto'
import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue, isPublicNotionBlock, resolveDefaultImageUrl } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { isRemoteImageAllowed } from './image-source'
import { normalizePageId } from './urls'

export function getSvgCover(recordMap: ExtendedRecordMap, pageId: string) {
  const id = normalizePageId(pageId)
  if (!id) return
  const block = getBlockValue(recordMap.block[id])
  if (
    !block?.alive ||
    (block.type !== 'page' && block.type !== 'collection_view_page') ||
    !isPublicNotionBlock(recordMap, id, siteConfig.rootNotionPageId)
  )
    return
  const raw = block.format?.page_cover
  if (!raw) return
  try {
    const url = new URL(raw)
    if (url.username || url.password) return
  } catch {
    // Attachment identifiers are resolved by Notion's public image mapper below.
  }
  const source = resolveDefaultImageUrl(raw, block, {
    isPublic: true,
    signedUrls: recordMap.signed_urls,
  })
  if (!source || !isRemoteImageAllowed(source)) return
  try {
    if (!decodeURIComponent(new URL(source).pathname).toLowerCase().endsWith('.svg')) return
  } catch {
    return
  }
  const revision = createHash('sha256').update(source).digest('hex').slice(0, 24)
  return { source, path: `/media/${id.replaceAll('-', '')}/cover-${revision}.svg` }
}

// Only the render copy changes; authorization and source lookup keep the original Notion map.
export function withSvgCovers(recordMap: ExtendedRecordMap, origin: string) {
  const block = { ...recordMap.block }
  for (const [id, entry] of Object.entries(block)) {
    const cover = getSvgCover(recordMap, id)
    if (!cover) continue
    const page = getBlockValue(entry)!
    block[id] = {
      ...entry,
      value: { ...page, format: { ...page.format, page_cover: `${origin}${cover.path}` } },
    }
  }
  return { ...recordMap, block }
}
