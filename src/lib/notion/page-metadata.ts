import 'server-only'

import type { Metadata } from 'next'
import { getSocialImageUrl, socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'
import { getPageInfo } from './page-info'
import { getNotionPage } from './get-page'
import { getPageUrl } from './index/lookup'
import { getEntryContext } from './entry-context'

export async function getPageMetadata(segment: string): Promise<Metadata> {
  const { pageId, recordMap } = await getNotionPage(segment)
  const info = getPageInfo(pageId, recordMap)
  const isHome = pageId === siteConfig.rootNotionPageId
  const url = await getPageUrl(pageId)
  const context = await getEntryContext(pageId)
  const title = isHome
    ? siteConfig.name
    : context
      ? `${info.title} | ${context.entry.title}`
      : info.title
  const description = info.description || siteConfig.description
  const image = getSocialImageUrl(pageId)

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
      images: [{ url: image, ...socialImageSize, alt: title }],
      ...(info.isArticle && {
        publishedTime: new Date(info.published).toISOString(),
        modifiedTime: new Date(info.lastEdited).toISOString(),
        tags: info.tags,
      }),
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
