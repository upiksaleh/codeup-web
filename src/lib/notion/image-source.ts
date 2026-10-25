import { siteConfig } from '@/site.config'

export function isRemoteImageAllowed(value: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      !url.port &&
      !url.username &&
      !url.password &&
      siteConfig.imageSources.some(
        ({ hostname, pathname }) => url.hostname === hostname && url.pathname.startsWith(pathname),
      )
    )
  } catch {
    return false
  }
}

export function canOptimizeImage(value: string) {
  if (value === siteConfig.logo) return true
  if (!isRemoteImageAllowed(value)) return false

  try {
    return !decodeURIComponent(new URL(value).pathname).toLowerCase().endsWith('.svg')
  } catch {
    return false
  }
}
