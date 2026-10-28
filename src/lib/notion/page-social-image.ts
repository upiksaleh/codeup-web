import { getNotionPage } from './get-page'
import { getPageInfo } from './page-info'
import { renderSocialImage } from '@/lib/social-image'
import { siteConfig } from '@/site.config'
import { getEntryContext } from './entry-context'

export async function renderPageSocialImage(path: string) {
  const { pageId: id, recordMap } = await getNotionPage(path)
  const info = getPageInfo(id, recordMap)
  const context = await getEntryContext(id)
  const section = siteConfig.navigation.find((link) => link.pageId === id)?.label
  const kicker = info.isArticle
    ? `Article · ${new Date(info.published).toLocaleDateString('en-US', {
        dateStyle: 'long',
        timeZone: 'UTC',
      })}`
    : section && section.toLowerCase() !== info.title.toLowerCase()
      ? section
      : (context?.entry.title ?? siteConfig.label)

  return renderSocialImage({
    title: info.title,
    description: info.description,
    kicker,
    tags: info.tags,
    cover: context?.cover ?? info.image,
  })
}
