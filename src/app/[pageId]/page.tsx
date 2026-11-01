import { NotionPage } from '@/components/notion-page'
import { getPageMetadata } from '@/lib/notion/page-metadata'
import { getPagePathSegments } from '@/lib/notion/index/lookup'

export async function generateStaticParams() {
  return (await getPagePathSegments())
    .filter((segments) => segments.length === 1)
    .map(([pageId]) => ({ pageId }))
}

export async function generateMetadata({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  return getPageMetadata(pageId)
}

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params

  return <NotionPage pageId={pageId} />
}
