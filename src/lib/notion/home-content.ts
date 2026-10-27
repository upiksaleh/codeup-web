import type { ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getBlockValue } from 'notion-utils'

export function hideHomePagesSection(recordMap: ExtendedRecordMap, pageId: string) {
  const page = getBlockValue(recordMap.block[pageId])
  const content = page?.content
  if (!page || !content) return recordMap

  const blocks = content.map((id) => getBlockValue(recordMap.block[id]))
  const heading = blocks.findIndex(
    (block) =>
      block?.type === 'header' && getBlockTitle(block, recordMap).trim().toLowerCase() === 'pages',
  )
  if (heading < 1 || blocks[heading - 1]?.type !== 'divider') return recordMap

  const end = blocks.findIndex((block, index) => index > heading && block?.type === 'divider')
  if (end === -1) return recordMap

  // Change only the render copy; discovery and child-page access keep the complete map.
  return {
    ...recordMap,
    block: {
      ...recordMap.block,
      [pageId]: {
        ...recordMap.block[pageId],
        value: {
          ...page,
          content: content.filter((_, index) => index < heading - 1 || index > end),
        },
      },
    },
  }
}
