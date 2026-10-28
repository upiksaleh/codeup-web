import { NotionPage } from '@/components/notion-page'
import { getPageMetadata } from '@/lib/notion/page-metadata'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  return getPageMetadata(pageId)
}

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params

  return <NotionPage pageId={pageId} />
}
