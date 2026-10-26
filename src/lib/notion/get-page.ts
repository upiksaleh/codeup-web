import 'server-only'

import { notFound } from 'next/navigation'
import { cache } from 'react'
import { loadNotionPage } from './load-page'
import { resolvePageId } from './page-url'
import { getSitePages, isReservedSlug } from './site-pages'

export const getNotionPage = cache(async (segment: string) => {
  let pageId = resolvePageId(segment)

  // Reserved routes, such as the studio's /about, never resolve to a Notion title.
  if (!pageId && isReservedSlug(segment)) notFound()

  if (!pageId && /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(segment) && segment.length <= 200) {
    const matches = (await getSitePages()).filter(({ slug }) => slug === segment)
    if (matches.length === 1) pageId = matches[0].id
  }

  if (!pageId) notFound()
  const recordMap = await loadNotionPage(pageId)
  if (!recordMap) notFound()

  return { pageId, recordMap }
})
