import 'server-only'

import { unstable_cache } from 'next/cache'
import type { ExtendedRecordMap, PreviewImage } from 'notion-types'
import { defaultMapImageUrl, getPageImageUrls } from 'notion-utils'
import sharp from 'sharp'
import { siteConfig } from '@/site.config'
import { canOptimizeImage, isRemoteImageAllowed } from './image-source'

const maxImageBytes = 10_000_000

async function readImage(url: string) {
  const signal = AbortSignal.timeout(8_000)

  for (let redirects = 0; redirects <= 3; redirects++) {
    if (!isRemoteImageAllowed(url)) throw new Error('Unsupported image source')
    const response = await fetch(url, { redirect: 'manual', cache: 'no-store', signal })

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) throw new Error('Image redirect has no location')
      url = new URL(location, url).href
      continue
    }

    if (
      !response.ok ||
      !/^image\/(?:png|jpe?g|webp|avif|gif)(?:;|$)/i.test(
        response.headers.get('content-type') ?? '',
      ) ||
      Number(response.headers.get('content-length')) > maxImageBytes
    ) {
      await response.body?.cancel()
      throw new Error('Image preview source is unavailable or unsupported')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('Image response has no body')
    const chunks: Uint8Array[] = []
    let bytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) return Buffer.concat(chunks)
      bytes += value.byteLength
      if (bytes > maxImageBytes) {
        await reader.cancel()
        throw new Error('Image preview source exceeds the size limit')
      }
      chunks.push(value)
    }
  }

  throw new Error('Too many image redirects')
}

const getImagePreview = unstable_cache(
  async (url: string): Promise<PreviewImage> => {
    const image = sharp(await readImage(url), { limitInputPixels: 40_000_000 }).rotate()
    const { data } = await image
      .resize(16, 16, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 40 })
      .toBuffer({ resolveWithObject: true })
    const metadata = await image.metadata()
    const { width, height } = metadata.autoOrient

    return {
      originalWidth: width,
      originalHeight: height,
      dataURIBase64: `data:image/webp;base64,${data.toString('base64')}`,
    }
  },
  ['image-preview', JSON.stringify(siteConfig.imageSources)],
  { revalidate: 86_400 },
)

export async function withImagePreviews(recordMap: ExtendedRecordMap) {
  const urls = getPageImageUrls(recordMap, { mapImageUrl: defaultMapImageUrl }).filter(
    canOptimizeImage,
  )
  const previews: ExtendedRecordMap['preview_images'] = {}

  for (let index = 0; index < urls.length; index += 4) {
    await Promise.all(
      urls.slice(index, index + 4).map(async (url) => {
        try {
          previews[url] = await getImagePreview(url)
        } catch {
          console.warn('Image preview unavailable', new URL(url).hostname)
        }
      }),
    )
  }

  return { ...recordMap, preview_images: previews }
}
