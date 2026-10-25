import type { MetadataRoute } from 'next'
import { siteConfig } from '@/site.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/search', '/api/'] },
    sitemap: `https://${siteConfig.domain}/sitemap.xml`,
  }
}
