import Image from 'next/image'
import Link from 'next/link'
import { getBlockValue } from 'notion-utils'
import { getNotionPage } from '@/lib/notion/get-page'
import { withHomeGalleries } from '@/lib/notion/entry-gallery'
import { hideHomePagesSection } from '@/lib/notion/home-content'
import { withImagePreviews } from '@/lib/notion/image-previews'
import { withRenderedBlocks } from '@/lib/notion/rendered-blocks'
import { getPageInfo } from '@/lib/notion/page-info'
import { normalizePageId } from '@/lib/notion/urls'
import { isPageBlock } from '@/lib/notion/record-map'
import { getPageUrls } from '@/lib/notion/index/lookup'
import { siteUrl } from '@/lib/site-url'
import { siteConfig } from '@/site.config'
import { getEntryContext } from '@/lib/notion/entry-context'
import { NotionContent } from './notion-content'
import { HomeHero } from './home-hero'
import { EntryShare } from './entry-share'
import { ProjectDetails } from './project-details'
import { NotionImage } from './notion-image'

export async function NotionPage({ pageId }: { pageId: string }) {
  const { recordMap: pageMap, pageId: id } = await getNotionPage(pageId)
  const recordMap = id === siteConfig.rootNotionPageId ? await withHomeGalleries(pageMap) : pageMap
  const context = await getEntryContext(id)
  const page = getBlockValue(recordMap.block[id])
  const isHome = id === siteConfig.rootNotionPageId
  const { isArticle, project, description, tags, title, published, lastEdited } = getPageInfo(
    id,
    recordMap,
  )
  const [pageUrls, renderMap] = await Promise.all([
    getPageUrls(
      Object.keys(recordMap.block).flatMap((blockId) =>
        isPageBlock(getBlockValue(recordMap.block[blockId]))
          ? (normalizePageId(blockId) ?? [])
          : [],
      ),
    ),
    withImagePreviews(isHome ? hideHomePagesSection(recordMap, id) : recordMap, id).then(
      (previewMap) => withRenderedBlocks(previewMap, id),
    ),
  ])
  const previewTargets = Object.fromEntries(
    Object.entries(pageUrls)
      .filter(([targetId]) => targetId !== id)
      .map(([targetId, url]) => [url, targetId]),
  )

  const articleData = isArticle && {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || undefined,
    datePublished: new Date(published).toISOString(),
    dateModified: new Date(lastEdited).toISOString(),
    keywords: tags.length ? tags.join(', ') : undefined,
    author: { '@type': 'Person', name: siteConfig.author },
    mainEntityOfPage: `${siteUrl}${pageUrls[id] ?? ''}`,
  }

  return (
    <>
      {articleData && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleData).replace(/</g, '\\u003c'),
            }}
          />
        </>
      )}
      <NotionContent
        recordMap={renderMap}
        pageId={id}
        pageUrls={pageUrls}
        previewTargets={previewTargets}
        isHome={isHome}
        isEntrySubpage={!!context}
        pageType={isArticle ? 'article' : project ? 'project' : undefined}
        pageFooter={
          (isArticle || project) &&
          pageUrls[id] && (
            <EntryShare
              kind={isArticle ? 'article' : 'project'}
              url={`${siteUrl}${pageUrls[id]}`}
              title={title}
            />
          )
        }
        pageProperties={
          project && (
            <ProjectDetails pageId={id} project={project} summary={description} tags={tags} />
          )
        }
        pageHeader={
          isHome ? (
            <HomeHero />
          ) : context ? (
            <Link className="entry-page-back" href={context.parent.url}>
              <span aria-hidden="true">←</span> Back to {context.parent.title}
            </Link>
          ) : (
            isArticle &&
            !page?.format?.page_icon && (
              <div className="notion-page-icon-hero notion-page-icon-image">
                <Image src={siteConfig.logo} alt={siteConfig.name} width={124} height={124} />
              </div>
            )
          )
        }
        pageCover={
          context?.cover ? (
            <div className="notion-page-cover-wrapper">
              <NotionImage
                src={context.cover}
                alt={context.entry.title}
                fill
                preload
                sizes="100vw"
                className="notion-page-cover"
                style={{ objectPosition: `center ${(1 - (context.coverPosition ?? 0.5)) * 100}%` }}
              />
            </div>
          ) : !isHome && (context || !page?.format?.page_cover) ? (
            <div className="notion-page-cover-wrapper fallback-cover" aria-hidden="true" />
          ) : undefined
        }
      />
    </>
  )
}
