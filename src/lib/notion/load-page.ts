import 'server-only'

import { NotionAPI } from 'notion-client'
import type { Block, Collection, ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'
import { cache } from 'react'
import { siteConfig } from '@/site.config'

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

export const loadNotionPage = cache(async (pageId: string) => {
  const recordMap = await fetchPage(pageId)
  const page = recordMap && getBlockValue(recordMap.block[pageId])

  if (
    !recordMap ||
    !page?.alive ||
    (page.type !== 'page' && page.type !== 'collection_view_page') ||
    !belongsToSite(recordMap, page)
  ) {
    return undefined
  }

  return recordMap
})
