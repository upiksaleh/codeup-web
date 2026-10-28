import Image from 'next/image'
import { getBlockValue } from 'notion-utils'
import { getNotionPage } from '@/lib/notion/get-page'
import { withHomeProjectGallery } from '@/lib/notion/entry-gallery'
import { hideHomePagesSection } from '@/lib/notion/home-content'
import { withImagePreviews } from '@/lib/notion/image-previews'
import { getPageInfo } from '@/lib/notion/page-info'
import { normalizePageId } from '@/lib/notion/page-id'
import { getSitePageUrls } from '@/lib/notion/site-pages'
import { siteConfig } from '@/site.config'
import { NotionContent } from './notion-content'
import { HomeHero } from './home-hero'
import { ProjectDetails } from './project-details'

export async function NotionPage({ pageId }: { pageId: string }) {
  const { recordMap: pageMap, pageId: id } = await getNotionPage(pageId)
  const recordMap =
    id === siteConfig.rootNotionPageId ? await withHomeProjectGallery(pageMap) : pageMap
  const page = getBlockValue(recordMap.block[id])
  const isHome = id === siteConfig.rootNotionPageId
  const { isArticle, project, description, tags, title, published, lastEdited } = getPageInfo(
    id,
    recordMap,
  )
  const [pageUrls, renderMap] = await Promise.all([
    getSitePageUrls(
      Object.keys(recordMap.block).flatMap((blockId) => normalizePageId(blockId) ?? []),
    ),
    withImagePreviews(isHome ? hideHomePagesSection(recordMap, id) : recordMap, id),
  ])

  const articleData = isArticle && {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || undefined,
    datePublished: new Date(published).toISOString(),
    dateModified: new Date(lastEdited).toISOString(),
    keywords: tags.length ? tags.join(', ') : undefined,
    author: { '@type': 'Person', name: siteConfig.author },
    mainEntityOfPage: `https://${siteConfig.domain}${pageUrls[id] ?? ''}`,
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
        isHome={isHome}
        pageType={isArticle ? 'article' : project ? 'project' : undefined}
        pageProperties={
          project && (
            <ProjectDetails pageId={id} project={project} summary={description} tags={tags} />
          )
        }
        pageHeader={
          isHome ? (
            <HomeHero />
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
          !isHome && !page?.format?.page_cover ? (
            <div className="notion-page-cover-wrapper fallback-cover" aria-hidden="true" />
          ) : undefined
        }
      />
    </>
  )
}
