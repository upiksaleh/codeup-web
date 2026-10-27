import 'server-only'

import type { ExtendedRecordMap } from 'notion-types'
import { getBlockCollectionId, getBlockValue } from 'notion-utils'
import { siteConfig } from '@/site.config'
import { loadNotionPage } from './load-page'
import { withImagePreviews } from './image-previews'

async function loadEntryGallery(kind: 'article' | 'project') {
  const pageId = kind === 'article' ? siteConfig.rootNotionPageId : siteConfig.projectsDatabaseId
  const recordMap = await loadNotionPage(pageId)
  if (!recordMap) throw new Error('The gallery source page is unavailable')

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
  return { ...gallery, recordMap: await withImagePreviews(gallery.recordMap) }
}

// The linked home view uses the Projects database gallery's display settings and results.
export async function withHomeProjectGallery(recordMap: ExtendedRecordMap) {
  const gallery = await loadEntryGallery('project')
  const projects = gallery.recordMap
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

  return {
    ...recordMap,
    block,
    collection: { ...recordMap.collection, ...projects.collection },
    collection_view: { ...recordMap.collection_view, ...projects.collection_view },
    collection_query: { ...recordMap.collection_query, ...projects.collection_query },
    signed_urls: { ...recordMap.signed_urls, ...projects.signed_urls },
  }
}
