import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unstable_cache } from 'next/cache'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
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

function wordmark(size: number) {
  return (
    <div style={{ display: 'flex', fontSize: size, letterSpacing: -1 }}>
      {siteConfig.name}
      <span style={{ color: colors.accent }}>.</span>
    </div>
  )
}

type Content = { title: string; description?: string; kicker: string; tags: string[]; logo: string }

// Cover band on top; text keeps the left column and the brand the right.
function coverLayout({
  title,
  description,
  kicker: label,
  tags,
  logo,
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
            width: brandWidth,
            background: colors.cover,
          }}
        >
          <img alt="" src={logo} width={110} height={110} style={{ borderRadius: 55 }} />
          {wordmark(30)}
          <div style={{ color: colors.coverInk, fontSize: 18 }}>{siteConfig.domain}</div>
        </div>
      </div>
    </div>
  )
}

function brandLayout({ title, description, kicker: label, tags, logo }: Content) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '56px 64px',
          borderTop: `10px solid ${colors.accent}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img alt="" src={logo} width={52} height={52} style={{ borderRadius: 26 }} />
          {wordmark(34)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 36 }}>
          {tagList(tags, 20)}
          <div style={{ marginLeft: 'auto', color: colors.muted, fontSize: 22 }}>
            {siteConfig.domain}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: panelWidth,
          background: colors.cover,
        }}
      >
        <img alt="" src={logo} width={220} height={220} style={{ borderRadius: 110 }} />
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
  const [logo, coverImage] = await Promise.all([
    readFile(join(process.cwd(), 'public', siteConfig.logo)).then((file) =>
      toDataUrl(file, 'image/png'),
    ),
    loadCover(cover),
  ])
  const content = { title, description, kicker, tags, logo }

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
