'use client'

import dynamic from 'next/dynamic'
import { getBlockCollectionId, getBlockValue } from 'notion-utils'
import type { ComponentProps } from 'react'
import { useNotionContext } from 'react-notion-x'
import { siteConfig } from '@/site.config'
import { useGalleryCardTitles } from './use-gallery-card-titles'

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((module) => module.Collection),
)

export type NotionCollectionProps = ComponentProps<typeof Collection>

export function NotionCollection({
  titleLines = 2,
  ...props
}: NotionCollectionProps & { titleLines?: number }) {
  const { recordMap } = useNotionContext()
  const collectionId = getBlockCollectionId(props.block, recordMap)
  const isArticleCollection = collectionId === siteConfig.articleCollectionId
  const isProjectCollection =
    !!collectionId &&
    getBlockValue(recordMap.collection[collectionId])?.parent_id === siteConfig.projectsDatabaseId
  const isEntryCollection = isArticleCollection || isProjectCollection
  const ref = useGalleryCardTitles(isEntryCollection, titleLines)

  return (
    <div
      ref={ref}
      id={isArticleCollection ? 'articles' : isProjectCollection ? 'projects' : undefined}
      className={`notion-collection-section${isEntryCollection ? ' entry-collection' : ''}${isArticleCollection ? ' article-collection' : isProjectCollection ? ' project-collection' : ''}`}
    >
      <Collection {...props} />
    </div>
  )
}
