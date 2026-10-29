import { notFound } from 'next/navigation'
import { normalizePageId } from '@/lib/notion/urls'
import { renderPageSocialImage } from '@/lib/notion/page-social-image'
import { renderSocialImage } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function GET(_request: Request, { params }: RouteContext<'/static/images/[image]'>) {
  const { image } = await params
  const pageId = normalizePageId(image.match(/^([a-f\d]{32})\.png$/)?.[1] ?? '')
  if (!pageId) notFound()

  if (pageId === siteConfig.rootNotionPageId) {
    return renderSocialImage({
      title: siteConfig.name,
      description: siteConfig.description,
      kicker: siteConfig.label,
    })
  }
  return renderPageSocialImage(pageId)
}
