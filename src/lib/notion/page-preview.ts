import type { Block, ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getBlockValue } from 'notion-utils'

// Keep a small, original block tree; never flatten images or rich text into search text.
export function selectPagePreview(recordMap: ExtendedRecordMap, pageId: string) {
  const page = getBlockValue(recordMap.block[pageId])
  if (!page) return undefined
  const blocks: ExtendedRecordMap['block'] = {}
  const collections: ExtendedRecordMap['collection'] = {}
  const selected = new Set<string>()
  const excluded = /^(page|collection_view|collection_view_page)$/

  function visit(id: string, depth: number): boolean {
    const block = getBlockValue(recordMap.block[id])
    if (!block?.alive || excluded.test(block.type) || selected.has(id) || selected.size >= 16)
      return false
    selected.add(id)
    const content =
      depth < 3 ? (block.content ?? []).filter((child) => visit(child, depth + 1)) : []
    blocks[id] = { ...recordMap.block[id], value: { ...block, content } }
    return true
  }

  const blockIds: string[] = []
  for (const id of page.content ?? []) {
    if (blockIds.length >= 3) break
    if (visit(id, 0)) blockIds.push(id)
  }

  // Retain ancestry for Notion's public image resolution.
  let current: Block | undefined = page
  const visited = new Set<string>()
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    blocks[current.id] = {
      ...recordMap.block[current.id],
      value: { ...current, content: current.id === pageId ? blockIds : [] },
    }
    let parentId: string = current.parent_id
    if (current.parent_table === 'collection') {
      const collection = getBlockValue(recordMap.collection[parentId])
      if (collection) {
        collections[parentId] = recordMap.collection[parentId]
        parentId = collection.parent_id
      }
    }
    current = getBlockValue(recordMap.block[parentId])
  }

  return {
    pageId,
    title: getBlockTitle(page, recordMap),
    blockIds,
    recordMap: {
      ...recordMap,
      block: blocks,
      collection: collections,
      collection_view: {},
      collection_query: {},
      notion_user: {},
      signed_urls: Object.fromEntries(
        Object.entries(recordMap.signed_urls ?? {}).filter(([id]) => selected.has(id)),
      ),
    },
  }
}

export type PagePreview = NonNullable<ReturnType<typeof selectPagePreview>>
