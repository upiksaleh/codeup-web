import type { ExtendedRecordMap } from 'notion-types'
import {
  defaultMapImageUrl,
  getBlockTitle,
  getBlockValue,
  getCanonicalPageId,
  getPageProperty,
} from 'notion-utils'
import { siteConfig } from '@/site.config'

export function getPageInfo(pageId: string, recordMap: ExtendedRecordMap) {
  const page = getBlockValue(recordMap.block[pageId])!
  const textProperty = (name: string) => {
    const value = getPageProperty<unknown>(name, page, recordMap)
    return typeof value === 'string' ? value.trim() : ''
  }
  const listProperty = (name: string) => {
    const value = getPageProperty<unknown>(name, page, recordMap)
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : []
  }
  // Links from Notion become hrefs, so only web URLs are kept.
  const urlProperty = (name: string) => {
    const value = textProperty(name)
    return /^https?:$/.test(URL.parse(value)?.protocol ?? '') ? value : undefined
  }
  const slug = getCanonicalPageId(pageId, recordMap, { uuid: false }) ?? ''
  const published = getPageProperty<unknown>('Published', page, recordMap)
  const image = textProperty('Social Image') || page.format?.page_cover
  const startDate = getPageProperty<unknown>('Start Date', page, recordMap)
  const isArticle =
    page.parent_table === 'collection' && page.parent_id === siteConfig.articleCollectionId
  const collection =
    page.parent_table === 'collection' ? getBlockValue(recordMap.collection[page.parent_id]) : null

  const kind = isArticle
    ? ('article' as const)
    : collection?.parent_id === siteConfig.projectsDatabaseId
      ? ('project' as const)
      : page.parent_id === siteConfig.notesPageId
        ? ('note' as const)
        : ('page' as const)

  return {
    id: pageId,
    parentId: page.parent_table === 'block' ? page.parent_id : undefined,
    title: getBlockTitle(page, recordMap) || siteConfig.name,
    description: textProperty('Summary') || textProperty('Description'),
    slug: slug.length <= 200 && /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(slug) ? slug : '',
    tags: listProperty('Tags'),
    image: image ? defaultMapImageUrl(image, page) : undefined,
    isArticle,
    kind,
    project:
      kind === 'project'
        ? {
            status: textProperty('Status'),
            startDate:
              typeof startDate === 'number' && Number.isFinite(startDate) ? startDate : undefined,
            techStack: listProperty('Tech Stack'),
            website: urlProperty('Website'),
            repository: urlProperty('Repository'),
          }
        : undefined,
    published:
      typeof published === 'number' && Number.isFinite(published) ? published : page.created_time,
    lastEdited: page.last_edited_time,
  }
}
