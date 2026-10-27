import { getNotionPage } from './get-page'
import { getPageInfo } from './page-info'
import { renderSocialImage } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export async function renderPageSocialImage(path: string) {
  const { pageId: id, recordMap } = await getNotionPage(path)
  const info = getPageInfo(id, recordMap)
  const section = siteConfig.navigation.find((link) => link.pageId === id)?.label
  const kicker = info.isArticle
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
