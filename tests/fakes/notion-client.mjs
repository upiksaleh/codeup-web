// Notion pages served from memory; tests edit `notion` and inspect `requests`.
export const notion = { pages: new Map(), edited: new Map(), fail: false }
export const requests = []

const record = (id) => {
  if (notion.fail) throw new Error('Notion is down')
  const page = notion.pages.get(id)
  return page && { value: { ...structuredClone(page), last_edited_time: notion.edited.get(id) } }
}

export async function fetchPage(pageId) {
  requests.push(`getPage:${pageId}`)
  const ids = [pageId, ...(notion.pages.get(pageId)?.related ?? [])]
  return {
    block: Object.fromEntries(ids.map((id) => [id, record(id)])),
    collection: {},
    collection_view: {},
    collection_query: {},
    signed_urls: {},
    notion_user: {},
  }
}

export async function fetchBlocks(blockIds) {
  requests.push(`getBlocks:${blockIds.length}`)
  return Object.fromEntries(blockIds.map((id) => [id, record(id)]))
}

export async function fetchLastEditedTimes(pageIds) {
  const blocks = await fetchBlocks(pageIds)
  return new Map(
    pageIds.map((id) => [
      id,
      blocks[id]?.value.alive ? blocks[id].value.last_edited_time : undefined,
    ]),
  )
}

export async function fetchCustomEmojiUrls() {
  return {}
}
