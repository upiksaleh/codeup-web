import { getNotionPage } from '@/lib/notion/get-page'
import { getPageInfo } from '@/lib/notion/page-info'
import { renderSocialImage, socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const revalidate = 300
export const alt = `${siteConfig.name} page preview`
export const size = socialImageSize
export const contentType = 'image/png'

export function generateStaticParams() {
  return []
}

export default async function Image({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const { pageId: id, recordMap } = await getNotionPage(pageId)
  const info = getPageInfo(id, recordMap)
  const section = siteConfig.navigation.find((link) => link.pageId === id)?.label
  const kicker = info.isBlogPost
    ? `Article · ${new Date(info.published).toLocaleDateString('en-US', {
        dateStyle: 'long',
        timeZone: 'UTC',
      })}`
    : section && section.toLowerCase() !== info.title.toLowerCase()
      ? section
      : siteConfig.label

  return renderSocialImage({
    title: info.title,
    description: info.description,
    kicker,
    tags: info.tags,
    cover: info.image,
  })
}
