import { NotionPage } from '@/components/notion-page'
import { getPageMetadata } from '@/lib/notion/page-metadata'
import { getPagePathSegments } from '@/lib/notion/index/lookup'

export async function generateStaticParams() {
  return (await getPagePathSegments())
    .filter((segments) => segments.length > 1)
    .map(([pageId, ...slug]) => ({ pageId, slug }))
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
