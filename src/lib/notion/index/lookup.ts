import 'server-only'

import { findConfiguredPath, findPageIdByPath, getDefaultPageUrl } from '../urls'
import { getEntryPages } from './entries'
import { getSitePages } from './site'

// Configured pages and entries resolve without the full index.
async function findKnownPageUrl(pageId: string) {
  return findConfiguredPath(pageId) ?? (await getEntryPages()).find(({ id }) => id === pageId)?.url
}

export async function isEntryOrConfiguredPage(pageId: string) {
  return (await findKnownPageUrl(pageId)) !== undefined
}

export async function findPageIdForPath(path: string) {
  const entryId = /^(article|project)\/[^/]+$/.test(path)
    ? findPageIdByPath(path, await getEntryPages())
    : undefined
  return entryId ?? findPageIdByPath(path, await getSitePages())
}

export async function getPageUrl(pageId: string) {
  return (
    (await findKnownPageUrl(pageId)) ??
    (await getSitePages()).find(({ id }) => id === pageId)?.url ??
    getDefaultPageUrl(pageId)
  )
}

export async function getPageUrls(pageIds: string[]) {
  const urls = new Map<string, string>()
  const unknown = new Set<string>()
  for (const id of new Set(pageIds)) {
    const url = await findKnownPageUrl(id)
    if (url) urls.set(id, url)
    else unknown.add(id)
  }
  if (unknown.size) {
    for (const { id, url } of await getSitePages()) if (unknown.has(id)) urls.set(id, url)
  }
  return Object.fromEntries(urls)
}
