import 'server-only'

import { NotionAPI } from 'notion-client'
import { getBlockValue, uuidToId } from 'notion-utils'

const notion = new NotionAPI({ ofetchOptions: { timeout: 15_000 } })

// Development only: one line per call with parameters, duration, and record counts.
async function logRequest<T>(name: string, params: object, run: () => Promise<T>) {
  if (process.env.NODE_ENV !== 'development') return run()
  const start = performance.now()
  let response: T | undefined
  let error: unknown
  try {
    return (response = await run())
  } catch (caught) {
    throw (error = caught)
  } finally {
    const map = (response as { recordMap?: object } | undefined)?.recordMap ?? response
    const records =
      map && typeof map === 'object'
        ? Object.fromEntries(
            Object.entries(map).flatMap(([table, rows]) =>
              rows && typeof rows === 'object' ? [[table, Object.keys(rows).length]] : [],
            ),
          )
        : undefined
    const detail = {
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.length : value,
        ]),
      ),
      ms: Math.round(performance.now() - start),
      ...(error ? { error: error instanceof Error ? error.message : String(error) } : { records }),
    }
    console.log(`notion ${name}`, JSON.stringify(detail))
  }
}

function isMissingPageError(error: unknown) {
  if (!(error instanceof Error)) return false
  const status = 'statusCode' in error ? error.statusCode : undefined
  return (
    ((status === 400 || status === 403 || status === 404) &&
      error.message.includes('/loadPageChunk')) ||
    error.message.startsWith('Notion page not found ')
  )
}

export async function fetchPage(pageId: string) {
  try {
    return await logRequest('getPage', { pageId: uuidToId(pageId) }, () =>
      notion.getPage(pageId, { throwOnCollectionErrors: true }),
    )
  } catch (error) {
    if (isMissingPageError(error)) return undefined
    throw new Error('Failed to load the Notion page', { cause: error })
  }
}

export async function fetchBlocks(blockIds: string[]) {
  const { recordMap } = await logRequest('getBlocks', { blockIds }, () =>
    notion.getBlocks(blockIds),
  )
  return recordMap.block
}

export async function fetchLastEditedTimes(pageIds: string[]) {
  const blocks = await fetchBlocks(pageIds)
  return new Map(
    pageIds.map((id) => {
      const block = getBlockValue(blocks[id])
      return [id, block?.alive ? block.last_edited_time : undefined]
    }),
  )
}

export async function fetchCustomEmojiUrls(pointers: { id: string; spaceId: string }[]) {
  const requests = pointers.map(({ id, spaceId }) => ({
    pointer: { table: 'custom_emoji', id, spaceId },
    version: -1,
  }))
  const { recordMap } = await logRequest('syncRecordValuesMain', { requests }, () =>
    notion.fetch<{
      recordMap: { custom_emoji?: Record<string, { value?: { value?: { url?: string } } }> }
    }>({ endpoint: 'syncRecordValuesMain', body: { requests } }),
  )
  return new Map(
    pointers.flatMap(({ id }) => {
      const url = recordMap.custom_emoji?.[id]?.value?.value?.url
      return url ? [[id, url]] : []
    }),
  )
}
