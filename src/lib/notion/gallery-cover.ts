import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue, getPageContentBlockIds } from 'notion-utils'

// The first card of the first gallery with page covers is the likely LCP image.
export function getFirstGalleryCoverCard(recordMap: ExtendedRecordMap, pageId: string) {
  for (const id of getPageContentBlockIds(recordMap, pageId)) {
    const block = getBlockValue(recordMap.block[id])
    if (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') continue
    const viewId = block.view_ids?.[0]
    const view = viewId ? getBlockValue(recordMap.collection_view[viewId]) : undefined
    const collectionId = getBlockCollectionId(block, recordMap)
    if (view?.type !== 'gallery' || !collectionId || !viewId) continue
    if (view.format?.gallery_cover?.type !== 'page_cover') return
    const query = recordMap.collection_query[collectionId]?.[viewId]
    return (query?.collection_group_results?.blockIds ?? query?.blockIds)?.[0]
  }
}
