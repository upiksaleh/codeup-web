import { unstable_cache } from 'next/cache'
import { notionImageProxyOrigin } from 'notion-utils'
import { notionIconFilename } from '@/lib/notion/icon-url'
import { isRemoteImageAllowed } from '@/lib/notion/image-source'
import { readImage } from '@/lib/notion/image-previews'
import { svgResponse } from '@/lib/svg-response'

export async function GET(request: Request, { params }: RouteContext<'/media/icons/[filename]'>) {
  const { filename } = await params
  const mode = new URL(request.url).searchParams.get('mode') ?? 'light'
  const noStore = { 'Cache-Control': 'no-store' }
  if (!notionIconFilename.test(filename) || !['light', 'dark'].includes(mode)) {
    return new Response('Icon not found', { status: 404, headers: noStore })
  }
  const source = `${notionImageProxyOrigin}/icons/${filename}?mode=${mode}`
  if (!isRemoteImageAllowed(source))
    return new Response('Icon not found', { status: 404, headers: noStore })
  try {
    const encoded = await unstable_cache(
      async () => (await readImage(source, /^image\/svg\+xml(?:;|$)/i)).toString('base64'),
      ['notion-icon', 'v1', source],
      { revalidate: 86_400 },
    )()
    return svgResponse(request, Buffer.from(encoded, 'base64'))
  } catch {
    return new Response('Icon temporarily unavailable', { status: 503, headers: noStore })
  }
}
