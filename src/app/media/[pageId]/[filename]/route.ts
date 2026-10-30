import { createHash } from 'node:crypto'
import { normalizePageId } from '@/lib/notion/urls'
import { loadSvgCover } from '@/lib/notion/svg-cover-source'

export async function GET(
  request: Request,
  { params }: RouteContext<'/media/[pageId]/[filename]'>,
) {
  const { pageId, filename } = await params
  const id = normalizePageId(pageId)
  const noStore = { 'Cache-Control': 'no-store' }
  if (!id || !/^cover-[a-f\d]{24}\.svg$/.test(filename)) {
    return new Response('Cover not found', { status: 404, headers: noStore })
  }
  try {
    const image = await loadSvgCover(id, filename)
    if (!image) return new Response('Cover not found', { status: 404, headers: noStore })
    const etag = `"${createHash('sha256').update(image).digest('hex')}"`
    const headers = {
      'Content-Type': 'image/svg+xml',
      'Content-Length': String(image.byteLength),
      'Content-Disposition': 'attachment; filename="cover.svg"',
      'Content-Security-Policy': "default-src 'self'; script-src 'none'; sandbox;",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      ETag: etag,
    }
    return request.headers.get('if-none-match') === etag
      ? new Response(null, { status: 304, headers })
      : new Response(new Uint8Array(image), { headers })
  } catch {
    return new Response('Cover temporarily unavailable', { status: 503, headers: noStore })
  }
}
