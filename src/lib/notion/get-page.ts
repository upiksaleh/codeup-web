import 'server-only'

import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'
import { loadNotionPage } from './load-page'
import { resolvePageId } from './page-url'
import { getSitePages, getSitePageUrl } from './site-pages'
import { isReservedSlug, isSupportedPagePath, resolveSitePageId } from './page-paths'

export const getNotionPage = cache(async (segment: string) => {
  if (!isSupportedPagePath(segment)) notFound()
  let pageId = resolvePageId(segment)

  // Reserved routes, such as the studio's /about, never resolve to a Notion title.
  if (!pageId && isReservedSlug(segment)) notFound()

  if (!pageId) pageId = resolveSitePageId(segment, await getSitePages())

  if (!pageId) notFound()
  const recordMap = await loadNotionPage(pageId)
  if (!recordMap) notFound()

  return { pageId, recordMap }
})

// Layouts validate before their loading boundary, preserving real 404 responses.
export async function validatePagePath(path: string) {
  const { pageId } = await getNotionPage(path)
  const url = await getSitePageUrl(pageId)
  if (`/${path}` !== url) permanentRedirect(url)
}
