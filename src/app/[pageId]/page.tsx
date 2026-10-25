import type { Metadata } from 'next'
import { getPageTitle } from 'notion-utils'
import { NotionPage } from '@/components/notion-page'
import { getNotionPage } from '@/lib/notion/get-page'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>
}): Promise<Metadata> {
  const { pageId } = await params
  const recordMap = await getNotionPage(pageId)
  const title = getPageTitle(recordMap) || siteConfig.name
  const url = getPageUrl(pageId)

  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteConfig.name,
      title,
      description: siteConfig.description,
      url,
    },
    twitter: { card: 'summary', title, description: siteConfig.description },
  }
}

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params

  return <NotionPage pageId={pageId} />
}
