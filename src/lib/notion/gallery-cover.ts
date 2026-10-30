import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue, getPageContentBlockIds } from 'notion-utils'

// Gallery rows hold up to three cards, so the first row holds the LCP image on any viewport.
const firstRowSize = 3

// Cards in the first row of the first gallery with page covers.
export function getFirstGalleryCoverCards(recordMap: ExtendedRecordMap, pageId: string) {
  for (const id of getPageContentBlockIds(recordMap, pageId)) {
    const block = getBlockValue(recordMap.block[id])
    if (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') continue
    const viewId = block.view_ids?.[0]
    const view = viewId ? getBlockValue(recordMap.collection_view[viewId]) : undefined
    const collectionId = getBlockCollectionId(block, recordMap)
    if (view?.type !== 'gallery' || !collectionId || !viewId) continue
    if (view.format?.gallery_cover?.type !== 'page_cover') return []
    const query = recordMap.collection_query[collectionId]?.[viewId]
    return (query?.collection_group_results?.blockIds ?? query?.blockIds ?? []).slice(
      0,
      firstRowSize,
    )
  }
  return []
}
