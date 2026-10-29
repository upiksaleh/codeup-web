import 'server-only'

import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'
import { findPageIdForPath, getPageUrl } from './index/lookup'
import { loadNotionPage } from './pages'
import { isReservedSlug, isSupportedPagePath, resolvePageId } from './urls'

export const getNotionPage = cache(async (segment: string) => {
  if (!isSupportedPagePath(segment)) notFound()
  let pageId = resolvePageId(segment)
  // Reserved routes never resolve to a Notion title.
  if (!pageId && isReservedSlug(segment)) notFound()
  pageId ??= await findPageIdForPath(segment)
  if (!pageId) notFound()

  const recordMap = await loadNotionPage(pageId)
  if (!recordMap) notFound()
  return { pageId, recordMap }
})

// Runs in layouts, before the loading boundary, so missing pages return a real 404.
export async function validatePagePath(path: string) {
  const { pageId } = await getNotionPage(path)
  const url = await getPageUrl(pageId)
  if (`/${path}` !== url) permanentRedirect(url)
}
