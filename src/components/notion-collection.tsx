'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getBlockCollectionId, getBlockValue, getTextContent } from 'notion-utils'
import type { ComponentProps } from 'react'
import { PageIcon, useNotionContext } from 'react-notion-x'
import { siteConfig } from '@/site.config'
import { useCardCovers } from './pointer-trail'
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
  const collection = collectionId ? getBlockValue(recordMap.collection[collectionId]) : undefined
  const isArticleCollection = collectionId === siteConfig.articleCollectionId
  const isProjectCollection =
    !!collectionId &&
    getBlockValue(recordMap.collection[collectionId])?.parent_id === siteConfig.projectsDatabaseId
  const isEntryCollection = isArticleCollection || isProjectCollection
  const ref = useGalleryCardTitles(isEntryCollection, isProjectCollection ? 1 : titleLines)
  useCardCovers(ref, isEntryCollection)
  const title = collection ? getTextContent(collection.name).trim() : ''
  const homeHeader = showViewAll && isEntryCollection && title

  return (
    <div
      ref={ref}
      id={isArticleCollection ? 'articles' : isProjectCollection ? 'projects' : undefined}
      className={`notion-collection-section${isEntryCollection ? ' entry-collection' : ''}${isArticleCollection ? ' article-collection' : isProjectCollection ? ' project-collection' : ''}${homeHeader ? ' home-collection' : ''}`}
    >
      {homeHeader && (
        <div className="home-collection-header">
          <div className="home-collection-heading">
            <div aria-hidden="true">
              <PageIcon block={props.block} defaultIcon={collection?.icon} hideDefaultIcon />
            </div>
            <h2>{title}</h2>
          </div>
          <Link
            className="collection-view-all"
            href={isArticleCollection ? '/articles' : '/projects'}
            lang="en"
          >
            View all <span aria-hidden="true">→</span>
            <span className="sr-only"> {isArticleCollection ? 'articles' : 'projects'}</span>
          </Link>
        </div>
      )}
      <Collection {...props} />
    </div>
  )
}
