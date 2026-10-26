import { renderPageSocialImage } from '@/lib/notion/page-social-image'
import { socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const revalidate = 300
export const alt = `${siteConfig.name} page preview`
export const size = socialImageSize
export const contentType = 'image/png'

export function generateStaticParams() {
  return []
}

export default async function Image({
  params,
}: {
  params: Promise<{ pageId: string; slug: string }>
}) {
  const { pageId: category, slug } = await params
  return renderPageSocialImage(`${category}/${slug}`)
}
