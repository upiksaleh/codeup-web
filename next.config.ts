import type { NextConfig } from 'next'
import { siteConfig } from './src/site.config'

const nextConfig: NextConfig = {
  agentRules: false,
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
  redirects() {
    return [{ source: '/blog/:path+', destination: '/article/:path+', permanent: true }]
  },
  images: {
    localPatterns: [{ pathname: siteConfig.logo, search: '' }],
    remotePatterns: siteConfig.imageSources.map(({ hostname, pathname }) => ({
      protocol: 'https',
      hostname,
      port: '',
      pathname: `${pathname}**`,
    })),
    qualities: [75],
    // Notion SVG covers load from the site origin; scripts inside them never run.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    maximumResponseBody: 10_000_000,
  },
}

export default nextConfig
