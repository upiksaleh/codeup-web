import { renderSocialImage, socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const alt = `${siteConfig.name}, ${siteConfig.label}`
export const size = socialImageSize
export const contentType = 'image/png'

export default function Image() {
  return renderSocialImage({
    title: siteConfig.name,
    description: siteConfig.description,
    kicker: siteConfig.label,
  })
}
