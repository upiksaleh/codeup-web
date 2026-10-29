import type { MetadataRoute } from 'next'
import { getSitePages } from '@/lib/notion/index/site'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (await getSitePages()).map(({ url, lastEdited }) => ({
    url: `${siteUrl}${url}`,
    lastModified: new Date(lastEdited),
  }))
  return [...pages, { url: `${siteUrl}/articles` }]
}
