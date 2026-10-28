import { renderPageSocialImage } from '@/lib/notion/page-social-image'
import { socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const alt = `${siteConfig.name} page preview`
export const size = socialImageSize
export const contentType = 'image/png'

export function generateStaticParams() {
  return []
}

export default async function Image({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  return renderPageSocialImage(pageId)
}
