import { createHash } from 'node:crypto'
import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue, resolveDefaultImageUrl } from 'notion-utils'
import { isRemoteImageAllowed } from './image-source'
import { hasPublicSiteAccess } from './record-map'
import { normalizePageId } from './urls'
import { getNotionIconPath } from './icon-url'

export function getSvgCover(recordMap: ExtendedRecordMap, pageId: string) {
  const id = normalizePageId(pageId)
  if (!id) return
  const block = getBlockValue(recordMap.block[id])
  if (
    !block?.alive ||
    (block.type !== 'page' && block.type !== 'collection_view_page') ||
    !hasPublicSiteAccess(recordMap, block)
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
export function withSvgMedia(recordMap: ExtendedRecordMap, origin: string) {
  const block = { ...recordMap.block }
  const collection = { ...recordMap.collection }
  const signedUrls = { ...recordMap.signed_urls }
  for (const [id, entry] of Object.entries(block)) {
    const page = getBlockValue(entry)!
    if (!page?.alive) continue
    const cover = getSvgCover(recordMap, id)
    const icon = getNotionIconPath(page.format?.page_icon)
    if (!cover && !icon) continue
    block[id] = {
      ...entry,
      value: {
        ...page,
        format: {
          ...page.format,
          ...(cover && { page_cover: `${origin}${cover.path}` }),
          ...(icon && { page_icon: `${origin}${icon}` }),
        },
      },
    }
    // The renderer's legacy per-page signature must not replace a public first-party cover.
    if (cover) delete signedUrls[id]
  }
  for (const [id, entry] of Object.entries(collection)) {
    const value = getBlockValue(entry)
    const icon = getNotionIconPath(value?.icon)
    // Catalog icons are public static files, independent of the collection's content permissions.
    if (value && icon) {
      collection[id] = { ...entry, value: { ...value, icon: `${origin}${icon}` } }
    }
  }
  return { ...recordMap, block, collection, signed_urls: signedUrls }
}
