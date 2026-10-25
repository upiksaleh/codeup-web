import type { NextConfig } from 'next'
import { siteConfig } from './src/site.config'

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    localPatterns: [{ pathname: siteConfig.logo, search: '' }],
    remotePatterns: siteConfig.imageSources.map(({ hostname, pathname }) => ({
      protocol: 'https',
      hostname,
      port: '',
      pathname: `${pathname}**`,
    })),
    qualities: [75],
    maximumResponseBody: 10_000_000,
  },
}

export default nextConfig
