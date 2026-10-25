import { siteConfig } from '@/site.config'
import { normalizePageId } from './page-id'

export function resolvePageId(segment: string) {
  return (
    siteConfig.navigation.find(({ path }) => path === `/${segment}`)?.pageId ??
    normalizePageId(segment)
  )
}

export function getPageUrl(pageId: string) {
  const id = resolvePageId(pageId)

  if (!id) return `https://www.notion.so/${encodeURIComponent(pageId)}`

  return (
    siteConfig.navigation.find(({ pageId }) => pageId === id)?.path ?? `/${id.replaceAll('-', '')}`
  )
}
