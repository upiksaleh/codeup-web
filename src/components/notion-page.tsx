import Image from 'next/image'
import { getBlockValue } from 'notion-utils'
import { getNotionPage } from '@/lib/notion/get-page'
import { withImagePreviews } from '@/lib/notion/image-previews'
import { getPageInfo } from '@/lib/notion/page-info'
import { normalizePageId } from '@/lib/notion/page-id'
import { getSitePageUrls } from '@/lib/notion/site-pages'
import { siteConfig } from '@/site.config'
import { NotionContent } from './notion-content'
import { HomeHero } from './home-hero'

export async function NotionPage({ pageId }: { pageId: string }) {
  const { recordMap, pageId: id } = await getNotionPage(pageId)
  const page = getBlockValue(recordMap.block[id])
  const isHome = id === siteConfig.rootNotionPageId
  const { isBlogPost } = getPageInfo(id, recordMap)
  const pageUrls = await getSitePageUrls(
    Object.keys(recordMap.block).flatMap((blockId) => normalizePageId(blockId) ?? []),
  )

  return (
    <NotionContent
      recordMap={await withImagePreviews(recordMap)}
      pageId={id}
      pageUrls={pageUrls}
      isHome={isHome}
      isBlogPost={isBlogPost}
      pageHeader={
        isHome ? (
          <HomeHero />
        ) : (
          isBlogPost &&
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
  )
}
