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

// Keep local development on its current origin. Replayed URLs already include Wayback's prefix.
export function localSvgMediaUrl(value: string, origin: string, darkMode = false) {
  const themed = /\/media\/icons\/[a-z\d_-]{1,120}\.svg$/i.test(value)
    ? `${value}?mode=${darkMode ? 'dark' : 'light'}`
    : value
  try {
    if (new URL(origin).origin !== origin) return themed
  } catch {
    return themed
  }
  const path = themed.startsWith(origin) ? themed.slice(origin.length) : themed
  return /^\/media\/(?:[a-f\d]{32}\/(?:cover|icon)-[a-f\d]{24}\.svg|icons\/[a-z\d_-]{1,120}\.svg\?mode=(?:light|dark))$/i.test(
    path,
  )
    ? path
    : themed
}

export function isSvgImage(value: string) {
  try {
    const pathname = value.startsWith('/') ? value.split('?')[0] : new URL(value).pathname
    return decodeURIComponent(pathname).toLowerCase().endsWith('.svg')
  } catch {
    return false
  }
}

// Raster images that sharp can resize and decode for previews.
export function canOptimizeImage(value: string) {
  if (value === siteConfig.logo) return true
  if (!isRemoteImageAllowed(value)) return false

  return !isSvgImage(value)
}
