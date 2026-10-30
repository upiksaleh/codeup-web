import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue, getPageContentBlockIds } from 'notion-utils'

const contentCovers = new Set(['page_content', 'page_content_first'])

// Blocks the renderer shows for a page: its content and collection cards, plus card content when a gallery uses it as the cover.
export function getRenderedBlockIds(recordMap: ExtendedRecordMap, blockId: string) {
  const ids = new Set(getPageContentBlockIds(recordMap, blockId))

  for (const id of [...ids]) {
    const block = getBlockValue(recordMap.block[id])
    if (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') continue
    const collectionId = getBlockCollectionId(block, recordMap)
    if (!collectionId) continue

    for (const viewId of block.view_ids ?? []) {
      const query = recordMap.collection_query[collectionId]?.[viewId]
      // Non-gallery views can keep a stale gallery_cover setting from Notion.
      const view = getBlockValue(recordMap.collection_view[viewId])
      const showsContent =
        view?.type === 'gallery' && contentCovers.has(view.format?.gallery_cover?.type ?? '')
      for (const pageId of query?.collection_group_results?.blockIds ?? query?.blockIds ?? []) {
        if (showsContent) {
          for (const contentId of getPageContentBlockIds(recordMap, pageId)) ids.add(contentId)
          continue
        }
        ids.add(pageId)
        const properties = getBlockValue(recordMap.block[pageId])?.properties ?? {}
        for (const value of Object.values(properties)) addMentionedPages(value, ids)
      }
    }
  }
  return ids
}

// Relation and mention properties point to pages as ['p', id].
function addMentionedPages(value: unknown, ids: Set<string>) {
  if (!Array.isArray(value)) return
  if (value[0] === 'p' && typeof value[1] === 'string') ids.add(value[1])
  for (const item of value) addMentionedPages(item, ids)
}

// The client copy keeps rendered blocks and their ancestors, which upstream public-access checks walk.
export function withRenderedBlocks(recordMap: ExtendedRecordMap, blockId: string) {
  const ids = getRenderedBlockIds(recordMap, blockId)
  for (const id of [...ids]) {
    let current = getBlockValue(recordMap.block[id])
    while (current) {
      const parentId =
        current.parent_table === 'collection'
          ? getBlockValue(recordMap.collection[current.parent_id])?.parent_id
          : current.parent_table === 'block'
            ? current.parent_id
            : undefined
      if (!parentId || ids.has(parentId)) break
      ids.add(parentId)
      current = getBlockValue(recordMap.block[parentId])
    }
  }

  const pick = <T>(records: Record<string, T> | undefined) =>
    Object.fromEntries(Object.entries(records ?? {}).filter(([id]) => ids.has(id)))
  return { ...recordMap, block: pick(recordMap.block), signed_urls: pick(recordMap.signed_urls) }
}
