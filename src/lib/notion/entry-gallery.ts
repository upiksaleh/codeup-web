import 'server-only'

import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue, getPageProperty } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { loadNotionPage } from './load-page'
import { withImagePreviews } from './image-previews'

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

async function loadEntryGallery(kind: 'article' | 'project') {
  const pageId = kind === 'article' ? siteConfig.rootNotionPageId : siteConfig.projectsDatabaseId
  const source = await loadNotionPage(pageId)
  if (!source) throw new Error('The gallery source page is unavailable')
  const recordMap = withoutHiddenCardIcons(source)

  for (const entry of Object.values(recordMap.block)) {
    const block = getBlockValue(entry)
    if (block?.type !== 'collection_view' && block?.type !== 'collection_view_page') continue
    const collectionId = getBlockCollectionId(block, recordMap)
    if (!collectionId) continue
    if (
      kind === 'article'
        ? collectionId !== siteConfig.articleCollectionId
        : block.id !== siteConfig.projectsDatabaseId
    )
      continue

    const viewId = block.view_ids.find(
      (id) => getBlockValue(recordMap.collection_view[id])?.type === 'gallery',
    )
    if (viewId && recordMap.collection_query[collectionId]?.[viewId]) {
      return { recordMap, blockId: block.id, collectionId, viewId }
    }
  }

  throw new Error(`The ${kind} gallery is unavailable`)
}

export async function getEntryGallery(kind: 'article' | 'project') {
  const gallery = await loadEntryGallery(kind)
  return { ...gallery, recordMap: await withImagePreviews(gallery.recordMap, gallery.blockId) }
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

// The linked home view uses the Projects database gallery's display settings and results.
export async function withHomeProjectGallery(recordMap: ExtendedRecordMap) {
  const gallery = await loadEntryGallery('project')
  const query = gallery.recordMap.collection_query[gallery.collectionId]![gallery.viewId]!
  const projects: ExtendedRecordMap = {
    ...gallery.recordMap,
    collection_query: {
      ...gallery.recordMap.collection_query,
      [gallery.collectionId]: {
        ...gallery.recordMap.collection_query[gallery.collectionId],
        [gallery.viewId]: {
          ...query,
          blockIds: sortByStartDate(gallery.recordMap, query.blockIds ?? []),
          ...(query.collection_group_results && {
            collection_group_results: {
              ...query.collection_group_results,
              blockIds: sortByStartDate(gallery.recordMap, query.collection_group_results.blockIds),
            },
          }),
        },
      },
    },
  }
  const block = { ...projects.block, ...recordMap.block }
  for (const [id, entry] of Object.entries(recordMap.block)) {
    const linked = getBlockValue(entry)
    if (
      linked?.type === 'collection_view' &&
      getBlockCollectionId(linked, recordMap) === gallery.collectionId
    ) {
      block[id] = { role: 'reader', value: { ...linked, view_ids: [gallery.viewId] } }
    }
  }

  return withoutHiddenCardIcons({
    ...recordMap,
    block,
    collection: { ...recordMap.collection, ...projects.collection },
    collection_view: { ...recordMap.collection_view, ...projects.collection_view },
    collection_query: { ...recordMap.collection_query, ...projects.collection_query },
    signed_urls: { ...recordMap.signed_urls, ...projects.signed_urls },
  })
}
