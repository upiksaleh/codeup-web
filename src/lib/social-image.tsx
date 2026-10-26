import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { siteConfig } from '@/site.config'
import { canOptimizeImage } from './notion/image-source'
import { readImage } from './notion/image-previews'

export const socialImageSize = { width: 1200, height: 630 }
const panelWidth = 440

const colors = {
  background: '#20282b',
  ink: '#f0f6f5',
  muted: '#b3c3c5',
  accent: '#7ed3c8',
  cover: '#287c73',
  tint: '#344a48',
}

function toDataUrl(image: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${image.toString('base64')}`
}

// Satori cannot decode every Notion format, so covers are cropped to a PNG panel first.
async function loadCover(url: string | undefined) {
  if (!url || !canOptimizeImage(url)) return
  try {
    const image = await sharp(await readImage(url), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(panelWidth, socialImageSize.height, { fit: 'cover' })
      .png()
      .toBuffer()
    return toDataUrl(image, 'image/png')
  } catch {
    console.warn('Social image cover unavailable', new URL(url).hostname)
  }
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
          <div style={{ display: 'flex', fontSize: 34, letterSpacing: -1 }}>
            {siteConfig.name}
            <span style={{ color: colors.accent }}>.</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div
            style={{
              color: colors.accent,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>
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
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                padding: '4px 14px',
                borderRadius: 6,
                color: colors.accent,
                background: colors.tint,
                fontSize: 20,
              }}
            >
              {tag}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', color: colors.muted, fontSize: 22 }}>
            {siteConfig.domain}
          </div>
        </div>
      </div>

      {coverImage ? (
        <img alt="" src={coverImage} width={panelWidth} height={socialImageSize.height} />
      ) : (
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
      )}
    </div>,
    socialImageSize,
  )
}
