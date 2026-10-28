import 'server-only'

import { unstable_cache } from 'next/cache'
import { NotionAPI } from 'notion-client'
import type { Block, Collection, ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'
import { cache } from 'react'
import { siteConfig } from '@/site.config'
import { normalizePageId } from './page-id'

const notion = new NotionAPI({ ofetchOptions: { timeout: 15_000 } })

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

const customEmojiPrefix = 'notion://custom_emoji/'

// Notion's image proxy cannot serve custom emoji icons, so swap them for their source URL.
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
      return [icon, { table: 'custom_emoji', id, spaceId }]
    }),
  )
  const urls = new Map<string, string>()

  try {
    const { recordMap: emojis } = await notion.fetch<{
      recordMap: { custom_emoji?: Record<string, { value?: { value?: { url?: string } } }> }
    }>({
      endpoint: 'syncRecordValuesMain',
      body: { requests: [...pointers.values()].map((pointer) => ({ pointer, version: -1 })) },
    })
    for (const [icon, { id }] of pointers) {
      const url = emojis.custom_emoji?.[id]?.value?.value?.url
      if (url) urls.set(icon, url)
    }
  } catch {
    console.warn('Custom emoji icons unavailable')
  }

  for (const { icon, set } of targets) set(urls.get(icon))
}

// The renderer maps Notion headings to h2/h3/h4 under the page's h1. A page that starts at
// Heading 2 would jump from h1 to h3, so shift its headings up one level.
function promoteHeadings(recordMap: ExtendedRecordMap) {
  const blocks = Object.values(recordMap.block).flatMap((entry) => getBlockValue(entry) ?? [])
  if (blocks.some((block) => block.type === 'header')) return

  for (const block of blocks as { type: string }[]) {
    if (block.type === 'sub_header') block.type = 'header'
    else if (block.type === 'sub_sub_header') block.type = 'sub_header'
  }
}

async function fetchPage(pageId: string) {
  try {
    return await notion.getPage(pageId, { throwOnCollectionErrors: true })
  } catch (error) {
    if (error instanceof Error) {
      const status = 'statusCode' in error ? error.statusCode : undefined

      if (
        ((status === 400 || status === 403 || status === 404) &&
          error.message.includes('/loadPageChunk')) ||
        error.message.startsWith('Notion page not found ')
      ) {
        return undefined
      }
    }

    throw new Error('Failed to load the Notion page', { cause: error })
  }
}

// Fetches without the cache, for callers that keep their own cache entry per page.
export async function fetchValidatedPage(pageId: string) {
  const recordMap = await fetchPage(pageId)
  if (recordMap) {
    await resolveCustomEmojiIcons(recordMap)
    promoteHeadings(recordMap)
  }
  const page = recordMap && getBlockValue(recordMap.block[pageId])

  if (
    !recordMap ||
    !page?.alive ||
    (page.type !== 'page' && page.type !== 'collection_view_page') ||
    !belongsToSite(recordMap, page)
  ) {
    return null
  }

  return recordMap
}

export const notionPageTag = (pageId: string) => `notion:${pageId}`

// Entries stay until /api/revalidate expires their tag; the daily limit covers a missed check.
export const cacheDuration = 86_400

export const loadNotionPage = cache(async (pageId: string) => {
  const id = normalizePageId(pageId)
  if (!id) return undefined
  const load = unstable_cache(
    () => fetchValidatedPage(id),
    ['notion-page', 'v3', siteConfig.rootNotionPageId, id],
    { tags: [notionPageTag(id)], revalidate: cacheDuration },
  )
  return (await load()) ?? undefined
})

// Current edit times, read in one request, for detecting changes.
export async function getLastEditedTimes(pageIds: string[]) {
  const { recordMap } = await notion.getBlocks(pageIds)
  return new Map(
    pageIds.map((id) => {
      const block = getBlockValue(recordMap.block[id])
      return [id, block?.alive ? block.last_edited_time : undefined]
    }),
  )
}
