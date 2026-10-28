import { Suspense } from 'react'
import { NotionPage } from '@/components/notion-page'
import { PageLoading } from '@/components/page-loading'
import { siteConfig } from '@/site.config'
import { getPageMetadata } from '@/lib/notion/page-metadata'

export function generateMetadata() {
  return getPageMetadata(siteConfig.rootNotionPageId)
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NotionPage pageId={siteConfig.rootNotionPageId} />
    </Suspense>
  )
}
