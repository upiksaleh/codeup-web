import type { MetadataRoute } from 'next'
import { getSitePages } from '@/lib/notion/index/site'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = (await getSitePages()).map(({ url, lastEdited }) => ({
    url: `${siteUrl}${url}`,
    lastModified: new Date(lastEdited),
  }))
  const unique = new Map(pages.map((page) => [page.url, page]))
  const articlesUrl = `${siteUrl}/articles`
  if (!unique.has(articlesUrl)) unique.set(articlesUrl, { url: articlesUrl })
  return [...unique.values()]
}
