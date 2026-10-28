import 'server-only'

import { lookup } from 'node:dns'
import { get } from 'node:https'
import sharp from 'sharp'
import { isPublicAddress, parseLinkMetadata, parsePreviewUrl } from './link-metadata'
import { memoizeAsync } from './memoize-async'

async function readPublicResource(value: string, signal: AbortSignal, image = false) {
  let url = parsePreviewUrl(value)
  const limit = image ? 5_000_000 : 1_000_000
  for (let redirects = 0; redirects <= 3; redirects++) {
    // Resolve in the socket's lookup callback so the validated IP is the one actually used.
    const response = await new Promise<import('node:http').IncomingMessage>((resolve, reject) => {
      const request = get(
        url,
        {
          signal,
          agent: false,
          headers: { Accept: image ? 'image/*' : 'text/html', 'Accept-Encoding': 'identity' },
          lookup(host, _options, callback) {
            lookup(host, { all: true }, (error, addresses) => {
              if (error) return callback(error, '', 4)
              if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
                return callback(new Error('Non-public preview address'), '', 4)
              }
              // Node may request all addresses when selecting an IP family.
              if (typeof _options === 'object' && _options.all) callback(null, addresses)
              else callback(null, addresses[0].address, addresses[0].family)
            })
          },
        },
        resolve,
      )
      request.on('error', reject)
    })
    const status = response.statusCode ?? 500
    if ([301, 302, 303, 307, 308].includes(status)) {
      response.destroy()
      if (!response.headers.location) throw new Error('Invalid preview redirect')
      url = parsePreviewUrl(new URL(response.headers.location, url).href)
      continue
    }
    const contentType = response.headers['content-type'] ?? ''
    const supported = image ? /^image\/(png|jpe?g|webp|gif|avif)(;|$)/i : /^text\/html(;|$)/i
    if (
      status < 200 ||
      status >= 300 ||
      !supported.test(contentType) ||
      Number(response.headers['content-length']) > limit
    ) {
      response.destroy()
      throw new Error('Unsupported preview response')
    }
    const chunks: Buffer[] = []
    let bytes = 0
    try {
      for await (const chunk of response) {
        bytes += chunk.length
        if (bytes > limit) throw new Error('Preview exceeds size limit')
        chunks.push(chunk)
      }
    } finally {
      response.destroy()
    }
    return { url: url.href, data: Buffer.concat(chunks) }
  }
  throw new Error('Too many preview redirects')
}

export const getExternalLinkPreview = memoizeAsync(
  async (url: string) => {
    const signal = AbortSignal.timeout(8_000)
    const html = await readPublicResource(url, signal)
    const metadata = parseLinkMetadata(html.data.toString('utf8'), html.url)
    const imageUrl = metadata.image
    metadata.image = undefined
    if (imageUrl) {
      try {
        const image = await readPublicResource(imageUrl, signal, true)
        const thumbnail = await sharp(image.data, { limitInputPixels: 20_000_000 })
          .rotate()
          .resize(600, 320, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer()
        metadata.image = `data:image/webp;base64,${thumbnail.toString('base64')}`
      } catch {
        /* Metadata remains useful without a thumbnail. */
      }
    }
    return metadata
  },
  { ttl: 3_600_000, maxEntries: 128 },
)
