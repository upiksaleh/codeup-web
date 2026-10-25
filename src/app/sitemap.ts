import type { MetadataRoute } from 'next'
import { getSitePages } from '@/lib/notion/site-pages'
import { siteConfig } from '@/site.config'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await getSitePages()).map(({ url, lastEdited }) => ({
    url: `https://${siteConfig.domain}${url}`,
    lastModified: new Date(lastEdited),
  }))
}
