import type { MetadataRoute } from 'next'
import { siteConfig } from '@/site.config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#282c34',
    theme_color: '#21252b',
    icons: [{ src: siteConfig.logo, sizes: '512x512', type: 'image/png', purpose: 'any' }],
  }
}
