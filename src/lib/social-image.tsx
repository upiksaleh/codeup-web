import 'server-only'

import { unstable_cache } from 'next/cache'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { LogoSymbol, LogoWordmark } from '@/components/logo'
import { siteConfig } from '@/site.config'
import { isRemoteImageAllowed } from './notion/image-source'
import { readImage } from './notion/image-previews'

export const socialImageSize = { width: 1200, height: 630 }

export function getSocialImageUrl(pageId: string = siteConfig.rootNotionPageId) {
  return `/static/images/${pageId.replaceAll('-', '')}.png`
}
const panelWidth = 440
const brandWidth = 260
const coverHeight = 280
const coverTypes = /^image\/(?:png|jpe?g|webp|avif|gif|svg\+xml)(?:;|$)/i

const colors = {
  background: '#20282b',
  ink: '#f0f6f5',
  muted: '#b3c3c5',
  accent: '#7ed3c8',
  cover: '#287c73',
  coverInk: '#d6ecea',
  tint: '#344a48',
  // Dark image, so the logo follows the site's dark theme: white.
  brand: '#ffffff',
}

function toDataUrl(image: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${image.toString('base64')}`
}

// Satori cannot decode every Notion format, so covers, SVG included, become a PNG band first.
// Cached because the uncached image fetch would make the ISR image route dynamic.
const renderCover = unstable_cache(
  async (url: string) => {
    const image = await sharp(await readImage(url, coverTypes), {
      density: 150,
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize(socialImageSize.width, coverHeight, { fit: 'cover' })
      .png()
      .toBuffer()
    return toDataUrl(image, 'image/png')
  },
  ['social-cover', 'v1', JSON.stringify(siteConfig.imageSources)],
  { revalidate: 86_400 },
)

async function loadCover(url: string | undefined) {
  if (!url || !isRemoteImageAllowed(url)) return
  try {
    return await renderCover(url)
  } catch {
    console.warn('Social image cover unavailable', new URL(url).hostname)
  }
}

function kicker(text: string, size: number) {
  return (
    <div
      style={{ color: colors.accent, fontSize: size, letterSpacing: 3, textTransform: 'uppercase' }}
    >
      {text}
    </div>
  )
}

function tagList(tags: string[], size: number) {
  return tags.slice(0, 4).map((tag) => (
    <div
      key={tag}
      style={{
        padding: '4px 14px',
        borderRadius: 6,
        color: colors.accent,
        background: colors.tint,
        fontSize: size,
      }}
    >
      {tag}
    </div>
  ))
}

function wordmark(width: number) {
  return <LogoWordmark width={width} fill={colors.brand} />
}

// Domain sits at the foot of the brand panel, like the address on the site hero.
function panelDomain(size: number, bottom: number) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        color: colors.coverInk,
        fontSize: size,
        letterSpacing: 1,
      }}
    >
      {siteConfig.domain}
    </div>
  )
}

type Content = { title: string; description?: string; kicker: string; tags: string[] }

// Cover band on top; text keeps the left column and the brand the right.
function coverLayout({
  title,
  description,
  kicker: label,
  tags,
  cover,
}: Content & { cover: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <img alt="" src={cover} width={socialImageSize.width} height={coverHeight} />
      <div style={{ display: 'flex', flex: 1, borderTop: `8px solid ${colors.accent}` }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '26px 48px 30px 64px',
          }}
        >
          {kicker(label, 20)}
          <div
            style={{
              display: 'block',
              marginTop: 10,
              fontSize: title.length <= 25 ? 58 : title.length <= 45 ? 46 : 40,
              lineHeight: 1.12,
              letterSpacing: -1,
              lineClamp: 2,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                display: 'block',
                marginTop: 12,
                color: colors.muted,
                fontSize: 22,
                lineHeight: 1.4,
                lineClamp: 2,
              }}
            >
              {description}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>{tagList(tags, 18)}</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            position: 'relative',
            width: brandWidth,
            background: colors.cover,
          }}
        >
          <LogoSymbol width={96} fill={colors.brand} />
          {wordmark(150)}
          {panelDomain(18, 28)}
        </div>
      </div>
    </div>
  )
}

function brandLayout({ title, description, kicker: label, tags }: Content) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '56px 64px',
          borderTop: `10px solid ${colors.accent}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {kicker(label, 22)}
          <div
            style={{
              display: 'block',
              marginTop: 18,
              fontSize: title.length > 60 ? 50 : 62,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                display: 'block',
                marginTop: 20,
                color: colors.muted,
                fontSize: 26,
                lineHeight: 1.4,
                lineClamp: 3,
              }}
            >
              {description}
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 36 }}>
            {tagList(tags, 20)}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          position: 'relative',
          width: panelWidth,
          background: colors.cover,
        }}
      >
        {/* All identity lives in the panel, like the cover layout. */}
        <LogoSymbol width={170} fill={colors.brand} />
        {wordmark(220)}
        {panelDomain(22, 48)}
      </div>
    </div>
  )
}

export async function renderSocialImage({
  title,
  description,
  kicker,
  tags = [],
  cover,
}: {
  title: string
  description?: string
  kicker: string
  tags?: string[]
  cover?: string
}) {
  const coverImage = await loadCover(cover)
  const content = { title, description, kicker, tags }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        color: colors.ink,
        background: colors.background,
      }}
    >
      {coverImage ? coverLayout({ ...content, cover: coverImage }) : brandLayout(content)}
    </div>,
    socialImageSize,
  )
}
