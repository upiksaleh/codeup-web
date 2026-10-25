import Link from 'next/link'
import { getBlockValue } from 'notion-utils'
import { getNotionPage } from '@/lib/notion/get-page'
import { resolvePageId } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'
import { NotionContent } from './notion-content'
import { HomeHero } from './home-hero'

export async function NotionPage({ pageId }: { pageId: string }) {
  const recordMap = await getNotionPage(pageId)
  const id = resolvePageId(pageId)!
  const page = getBlockValue(recordMap.block[id])
  const isHome = id === siteConfig.rootNotionPageId

  return (
    <NotionContent
      recordMap={recordMap}
      pageId={id}
      isHome={isHome}
      pageHeader={
        isHome ? (
          <HomeHero />
        ) : (
          <nav className="page-breadcrumb" aria-label="Breadcrumb" lang="en">
            <Link href="/">← {siteConfig.name}</Link>
          </nav>
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
