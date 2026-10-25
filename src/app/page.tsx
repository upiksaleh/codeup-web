import { Suspense } from 'react'
import { NotionPage } from '@/components/notion-page'
import { PageLoading } from '@/components/page-loading'
import { siteConfig } from '@/site.config'

export const revalidate = 300

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NotionPage pageId={siteConfig.rootNotionPageId} />
    </Suspense>
  )
}
