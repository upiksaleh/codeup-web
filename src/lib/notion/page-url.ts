import { siteConfig } from '@/site.config'
import { normalizePageId } from './page-id'

export function getPageUrl(pageId: string) {
  const id = normalizePageId(pageId)

  if (!id) return `https://www.notion.so/${encodeURIComponent(pageId)}`
  if (id === siteConfig.rootNotionPageId) return '/'

  return `/${id.replaceAll('-', '')}`
}
