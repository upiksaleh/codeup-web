import { notionImageProxyOrigin } from 'notion-utils'
import { isRemoteImageAllowed } from './image-source'

export const notionIconFilename = /^[a-z\d_-]{1,120}\.svg$/i

export function getNotionIconPath(value: string | undefined) {
  if (!value) return
  try {
    const url = new URL(value, notionImageProxyOrigin)
    if (!isRemoteImageAllowed(url.href) || !url.pathname.startsWith('/icons/')) return
    const filename = url.pathname.slice('/icons/'.length)
    if (notionIconFilename.test(filename)) return `/media/icons/${filename}`
  } catch {
    return
  }
}
