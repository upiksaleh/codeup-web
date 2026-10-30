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

// The Next.js optimizer serves these from the site origin; SVG passes through unchanged.
export function canServeImage(value: string) {
  return value === siteConfig.logo || isRemoteImageAllowed(value)
}

// Raster images that sharp can resize and decode for previews.
export function canOptimizeImage(value: string) {
  if (value === siteConfig.logo) return true
  if (!isRemoteImageAllowed(value)) return false

  try {
    return !decodeURIComponent(new URL(value).pathname).toLowerCase().endsWith('.svg')
  } catch {
    return false
  }
}
