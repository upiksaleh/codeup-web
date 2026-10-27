import { renderSocialImage, socialImageSize } from '@/lib/social-image'
import { siteConfig } from '@/site.config'

export const alt = 'Projects'
export const size = socialImageSize
export const contentType = 'image/png'

export default function Image() {
  return renderSocialImage({ title: 'Projects', kicker: siteConfig.name })
}
