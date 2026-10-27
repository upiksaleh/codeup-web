import type { ExtendedRecordMap } from 'notion-types'
import {
  getBlockCollectionId,
  getBlockValue,
  getPageContentBlockIds,
  getPageImageUrls,
} from 'notion-utils'

export function getPreviewImageUrls(recordMap: ExtendedRecordMap, blockId: string) {
  const visible = new Set(getPageContentBlockIds(recordMap, blockId))

  for (const id of [...visible]) {
    const block = getBlockValue(recordMap.block[id])
    if (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') continue
    const collectionId = getBlockCollectionId(block, recordMap)
    if (!collectionId) continue

    for (const viewId of block.view_ids) {
      const query = recordMap.collection_query[collectionId]?.[viewId]
      const pageIds = query?.collection_group_results?.blockIds ?? query?.blockIds ?? []
      for (const pageId of pageIds) {
        for (const contentId of getPageContentBlockIds(recordMap, pageId)) visible.add(contentId)
      }
    }
  }

  // Keep ancestry in the map so upstream URL resolution retains its public-access checks.
  return getPageImageUrls(recordMap, {
    mapImageUrl: (url, block) => (visible.has(block.id) ? url : undefined),
  })
}
