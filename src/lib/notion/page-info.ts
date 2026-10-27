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
  const slug = getCanonicalPageId(pageId, recordMap, { uuid: false }) ?? ''
  const published = getPageProperty<unknown>('Published', page, recordMap)
  const image = textProperty('Social Image') || page.format?.page_cover
  const tags = getPageProperty<unknown>('Tags', page, recordMap)
  const isArticle =
    page.parent_table === 'collection' && page.parent_id === siteConfig.articleCollectionId
  const collection =
    page.parent_table === 'collection' ? getBlockValue(recordMap.collection[page.parent_id]) : null

  return {
    id: pageId,
    title: getBlockTitle(page, recordMap) || siteConfig.name,
    description: textProperty('Description') || textProperty('Summary'),
    slug: slug.length <= 200 && /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(slug) ? slug : '',
    tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [],
    image: image ? defaultMapImageUrl(image, page) : undefined,
    isArticle,
    kind: isArticle
      ? ('article' as const)
      : collection?.parent_id === siteConfig.projectsDatabaseId
        ? ('project' as const)
        : page.parent_id === siteConfig.notesPageId
          ? ('note' as const)
          : ('page' as const),
    published:
      typeof published === 'number' && Number.isFinite(published) ? published : page.created_time,
    lastEdited: page.last_edited_time,
  }
}
