import type { MetadataRoute } from 'next'
import { getSitePages } from '@/lib/notion/site-pages'
import { siteConfig } from '@/site.config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (await getSitePages()).map(({ url, lastEdited }) => ({
    url: `https://${siteConfig.domain}${url}`,
    lastModified: new Date(lastEdited),
  }))
  return [...pages, { url: `https://${siteConfig.domain}/articles` }]
}
