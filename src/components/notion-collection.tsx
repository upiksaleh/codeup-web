'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getBlockCollectionId, getBlockValue } from 'notion-utils'
import type { ComponentProps } from 'react'
import { useNotionContext } from 'react-notion-x'
import { siteConfig } from '@/site.config'
import { useCardCoverTrails } from './pointer-trail'
import { useGalleryCardTitles } from './use-gallery-card-titles'

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((module) => module.Collection),
)

export type NotionCollectionProps = ComponentProps<typeof Collection>

export function NotionCollection({
  titleLines = 2,
  showViewAll = false,
  ...props
}: NotionCollectionProps & { titleLines?: number; showViewAll?: boolean }) {
  const { recordMap } = useNotionContext()
  const collectionId = getBlockCollectionId(props.block, recordMap)
  const isArticleCollection = collectionId === siteConfig.articleCollectionId
  const isProjectCollection =
    !!collectionId &&
    getBlockValue(recordMap.collection[collectionId])?.parent_id === siteConfig.projectsDatabaseId
  const isEntryCollection = isArticleCollection || isProjectCollection
  const ref = useGalleryCardTitles(isEntryCollection, isProjectCollection ? 1 : titleLines)
  useCardCoverTrails(ref, isEntryCollection)

  return (
    <div
      ref={ref}
      id={isArticleCollection ? 'articles' : isProjectCollection ? 'projects' : undefined}
      className={`notion-collection-section${isEntryCollection ? ' entry-collection' : ''}${isArticleCollection ? ' article-collection' : isProjectCollection ? ' project-collection' : ''}`}
    >
      <Collection {...props} />
      {showViewAll && isEntryCollection && (
        <Link
          className="collection-view-all"
          href={isArticleCollection ? '/articles' : '/projects'}
        >
          View all {isArticleCollection ? 'articles' : 'projects'}
        </Link>
      )}
    </div>
  )
}
