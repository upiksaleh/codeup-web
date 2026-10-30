import 'server-only'

import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue, getPageProperty } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { loadNotionPage } from './pages'
import { withImagePreviews } from './image-previews'
import { withRenderedBlocks } from './rendered-blocks'
import { withSvgMedia } from './svg-media'
import { siteUrl } from '@/lib/site-url'

// Entries with the meta_hide_icon_on_card checkbox keep their icon on their own page only.
function withoutHiddenCardIcons(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  const block = { ...recordMap.block }
  for (const [id, entry] of Object.entries(block)) {
    const value = getBlockValue(entry)
    if (!value?.format?.page_icon) continue
    if (getPageProperty<unknown>('meta_hide_icon_on_card', value, recordMap) !== true) continue
    const { page_icon: _, ...format } = value.format
    block[id] = { ...entry, value: { ...value, format } } as typeof entry
  }
  return { ...recordMap, block }
}

export const entryDatabaseIds = {
  article: siteConfig.articlesDatabaseId,
  project: siteConfig.projectsDatabaseId,
}

// Each gallery uses the first Gallery view of its full-page database.
async function loadEntryGallery(kind: 'article' | 'project') {
  const pageId = entryDatabaseIds[kind]
  const source = await loadNotionPage(pageId)
  if (!source) throw new Error(`The ${kind} database page is unavailable`)
  const recordMap = withoutHiddenCardIcons(source)
  const block = getBlockValue(recordMap.block[pageId])
  if (block?.type === 'collection_view_page') {
    const collectionId = getBlockCollectionId(block, recordMap)
    const viewId = block.view_ids.find(
      (id) => getBlockValue(recordMap.collection_view[id])?.type === 'gallery',
    )
    if (collectionId && viewId && recordMap.collection_query[collectionId]?.[viewId]) {
      return { recordMap, blockId: block.id, collectionId, viewId }
    }
  }

  throw new Error(`The ${kind} gallery is unavailable`)
}

type EntryGallery = Awaited<ReturnType<typeof loadEntryGallery>>

export async function getEntryGallery(kind: 'article' | 'project') {
  const gallery = await loadEntryGallery(kind)
  const recordMap = await withImagePreviews(gallery.recordMap, gallery.blockId)
  return {
    ...gallery,
    recordMap: withSvgMedia(withRenderedBlocks(recordMap, gallery.blockId), siteUrl),
  }
}

function sortByStartDate(recordMap: ExtendedRecordMap, ids: string[]) {
  const date = (id: string) => {
    const page = getBlockValue(recordMap.block[id])
    if (!page) return 0
    const value =
      getPageProperty<unknown>('Start Date', page, recordMap) ??
      getPageProperty<unknown>('Published', page, recordMap)
    return typeof value === 'number' && Number.isFinite(value) ? value : page.created_time
  }
  return [...ids].sort((a, b) => date(b) - date(a))
}

// Home galleries list only entries with the Featured checkbox.
function withFeaturedEntries(recordMap: ExtendedRecordMap, collectionIds: string[]) {
  const isFeatured = (id: string) => {
    const page = getBlockValue(recordMap.block[id])
    return !!page && getPageProperty<unknown>('Featured', page, recordMap) === true
  }
  const collectionQuery = { ...recordMap.collection_query }
  for (const collectionId of collectionIds) {
    const views = collectionQuery[collectionId]
    if (!views) continue
    collectionQuery[collectionId] = Object.fromEntries(
      Object.entries(views).map(([viewId, query]) => {
        const blockIds = (query.blockIds ?? []).filter(isFeatured)
        return [
          viewId,
          {
            ...query,
            total: blockIds.length,
            blockIds,
            ...(query.collection_group_results && {
              collection_group_results: {
                ...query.collection_group_results,
                blockIds: query.collection_group_results.blockIds.filter(isFeatured),
              },
            }),
          },
        ]
      }),
    )
  }
  return { ...recordMap, collection_query: collectionQuery }
}

function withSortedGalleryQuery({ recordMap, collectionId, viewId }: EntryGallery) {
  const query = recordMap.collection_query[collectionId]![viewId]!
  return {
    ...recordMap.collection_query[collectionId],
    [viewId]: {
      ...query,
      blockIds: sortByStartDate(recordMap, query.blockIds ?? []),
      ...(query.collection_group_results && {
        collection_group_results: {
          ...query.collection_group_results,
          blockIds: sortByStartDate(recordMap, query.collection_group_results.blockIds),
        },
      }),
    },
  }
}

// Linked home views use their database's Gallery view settings and results.
export async function withHomeGalleries(recordMap: ExtendedRecordMap) {
  const galleries = await Promise.all([loadEntryGallery('article'), loadEntryGallery('project')])
  const block = Object.assign(
    {},
    ...galleries.map((gallery) => gallery.recordMap.block),
    recordMap.block,
  ) as ExtendedRecordMap['block']
  const merged: ExtendedRecordMap = { ...recordMap, block }
  for (const gallery of galleries) {
    merged.collection = { ...merged.collection, ...gallery.recordMap.collection }
    merged.collection_view = { ...merged.collection_view, ...gallery.recordMap.collection_view }
    merged.collection_query = {
      ...merged.collection_query,
      ...gallery.recordMap.collection_query,
      [gallery.collectionId]: withSortedGalleryQuery(gallery),
    }
    merged.signed_urls = { ...merged.signed_urls, ...gallery.recordMap.signed_urls }
    for (const [id, entry] of Object.entries(recordMap.block)) {
      const linked = getBlockValue(entry)
      if (
        linked?.type === 'collection_view' &&
        getBlockCollectionId(linked, recordMap) === gallery.collectionId
      ) {
        block[id] = { role: 'reader', value: { ...linked, view_ids: [gallery.viewId] } }
      }
    }
  }

  return withFeaturedEntries(
    withoutHiddenCardIcons(merged),
    galleries.map((gallery) => gallery.collectionId),
  )
}
