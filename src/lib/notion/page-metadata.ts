import 'server-only'

import type { Metadata } from 'next'
import { siteConfig } from '@/site.config'
import { getPageInfo } from './page-info'
import { getNotionPage } from './get-page'
import { getSitePageUrl } from './site-pages'
import { getEntryContext } from './entry-context'

export async function getPageMetadata(segment: string): Promise<Metadata> {
  const { pageId, recordMap } = await getNotionPage(segment)
  const info = getPageInfo(pageId, recordMap)
  const isHome = pageId === siteConfig.rootNotionPageId
  const url = await getSitePageUrl(pageId)
  const context = await getEntryContext(pageId)
  const title = isHome
    ? siteConfig.name
    : context
      ? `${info.title} | ${context.entry.title}`
      : info.title
  const description = info.description || siteConfig.description
  const image = segment.includes('/')
    ? `/api/page-image?${new URLSearchParams({ path: segment })}`
    : undefined

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: url, types: { 'application/rss+xml': '/feed' } },
    openGraph: {
      type: info.isArticle ? 'article' : 'website',
      siteName: siteConfig.name,
      title,
      description,
      url,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      ...(info.isArticle && {
        publishedTime: new Date(info.published).toISOString(),
        modifiedTime: new Date(info.lastEdited).toISOString(),
        tags: info.tags,
      }),
    },
    // Entry paths use the shared image endpoint; other pages use metadata-file routes.
    twitter: { card: 'summary_large_image', title, description, ...(image && { images: [image] }) },
  }
}
