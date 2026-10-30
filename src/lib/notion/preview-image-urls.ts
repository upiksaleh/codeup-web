import type { ExtendedRecordMap } from 'notion-types'
import { getPageImageUrls } from 'notion-utils'
import { getRenderedBlockIds } from './rendered-blocks'

export function getPreviewImageUrls(recordMap: ExtendedRecordMap, blockId: string) {
  const visible = getRenderedBlockIds(recordMap, blockId)

  // Keep ancestry in the map so upstream URL resolution retains its public-access checks.
  return getPageImageUrls(recordMap, {
    mapImageUrl: (url, block) => (visible.has(block.id) ? url : undefined),
  })
}
