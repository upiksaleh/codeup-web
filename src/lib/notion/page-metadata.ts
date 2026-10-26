import 'server-only'

import type { Metadata } from 'next'
import { siteConfig } from '@/site.config'
import { getPageInfo } from './page-info'
import { getNotionPage } from './get-page'
import { getSitePageUrl } from './site-pages'

export async function getPageMetadata(segment: string): Promise<Metadata> {
  const { pageId, recordMap } = await getNotionPage(segment)
  const info = getPageInfo(pageId, recordMap)
  const isHome = pageId === siteConfig.rootNotionPageId
  const url = await getSitePageUrl(pageId)
  const title = isHome ? siteConfig.name : info.title
  const description = info.description || siteConfig.description

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: url, types: { 'application/rss+xml': '/feed' } },
    openGraph: {
      type: info.isBlogPost ? 'article' : 'website',
      siteName: siteConfig.name,
      title,
      description,
      url,
      ...(info.isBlogPost && {
        publishedTime: new Date(info.published).toISOString(),
        modifiedTime: new Date(info.lastEdited).toISOString(),
        tags: info.tags,
      }),
    },
    // Images come from the generated opengraph-image route.
    twitter: { card: 'summary_large_image', title, description },
  }
}
