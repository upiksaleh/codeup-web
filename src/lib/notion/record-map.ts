import 'server-only'

import type { Block, Collection, ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { fetchCustomEmojiUrls } from './client'

export function isPageBlock(block?: { type: string }) {
  return block?.type === 'page' || block?.type === 'collection_view_page'
}

export function belongsToSite(recordMap: ExtendedRecordMap, page: Block) {
  let current: Block | Collection | undefined = page
  const visited = new Set<string>()
  while (current && !visited.has(current.id)) {
    if (current.id === siteConfig.rootNotionPageId) return true
    visited.add(current.id)
    current =
      current.parent_table === 'collection'
        ? getBlockValue(recordMap.collection[current.parent_id])
        : getBlockValue(recordMap.block[current.parent_id])
  }
  return false
}

export function findSitePageIds(recordMap: ExtendedRecordMap) {
  return Object.keys(recordMap.block).filter((id) => {
    const block = getBlockValue(recordMap.block[id])
    return block?.alive && isPageBlock(block) && belongsToSite(recordMap, block)
  })
}

const customEmojiPrefix = 'notion://custom_emoji/'

// Notion's image proxy cannot serve custom emoji, so use their source URL.
async function resolveCustomEmojiIcons(recordMap: ExtendedRecordMap) {
  const targets: { icon: string; set: (url?: string) => void }[] = []
  const collect = (icon: string | undefined, set: (url?: string) => void) => {
    if (icon?.startsWith(customEmojiPrefix)) targets.push({ icon, set })
  }
  for (const entry of Object.values(recordMap.block)) {
    const format = getBlockValue(entry)?.format
    if (format) collect(format.page_icon, (url) => (format.page_icon = url))
  }
  for (const entry of Object.values(recordMap.collection ?? {})) {
    const collection = getBlockValue(entry)
    if (collection) collect(collection.icon, (url) => (collection.icon = url as string))
  }
  if (!targets.length) return

  const pointers = new Map(
    targets.map(({ icon }) => {
      const [spaceId, id] = icon.slice(customEmojiPrefix.length).split('/')
      return [icon, { id, spaceId }]
    }),
  )
  let urls = new Map<string, string>()
  try {
    urls = await fetchCustomEmojiUrls([...pointers.values()])
  } catch {
    console.warn('Custom emoji icons unavailable')
  }
  for (const { icon, set } of targets) set(urls.get(pointers.get(icon)!.id))
}

// Pages that start at Heading 2 move up one level so headings follow the page h1.
function promoteHeadings(recordMap: ExtendedRecordMap) {
  const blocks = Object.values(recordMap.block).flatMap((entry) => getBlockValue(entry) ?? [])
  if (blocks.some((block) => block.type === 'header')) return
  for (const block of blocks as { type: string }[]) {
    if (block.type === 'sub_header') block.type = 'header'
    else if (block.type === 'sub_sub_header') block.type = 'sub_header'
  }
}

export async function prepareRecordMap(recordMap: ExtendedRecordMap) {
  await resolveCustomEmojiIcons(recordMap)
  promoteHeadings(recordMap)
}
