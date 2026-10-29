import { siteConfig } from '@/site.config'

function getHost() {
  if (process.env.VERCEL_ENV === 'preview') {
    return process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  }
  return process.env.VERCEL_PROJECT_PRODUCTION_URL || siteConfig.domain
}

export const siteUrl = `https://${getHost()}`
