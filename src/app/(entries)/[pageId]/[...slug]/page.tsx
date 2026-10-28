import { NotionPage } from '@/components/notion-page'
import { getPageMetadata } from '@/lib/notion/page-metadata'

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string; slug: string[] }>
}) {
  const { pageId: category, slug } = await params
  return getPageMetadata(`${category}/${slug.join('/')}`)
}

export default async function Page({
  params,
}: {
  params: Promise<{ pageId: string; slug: string[] }>
}) {
  const { pageId: category, slug } = await params
  return <NotionPage pageId={`${category}/${slug.join('/')}`} />
}
