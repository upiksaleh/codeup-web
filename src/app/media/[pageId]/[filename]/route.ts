import { svgResponse } from '@/lib/svg-response'
import { normalizePageId } from '@/lib/notion/urls'
import { loadSvgMedia } from '@/lib/notion/svg-media-source'

export async function GET(
  request: Request,
  { params }: RouteContext<'/media/[pageId]/[filename]'>,
) {
  const { pageId, filename } = await params
  const id = normalizePageId(pageId)
  const noStore = { 'Cache-Control': 'no-store' }
  if (!id || !/^(?:cover|icon)-[a-f\d]{24}\.svg$/.test(filename)) {
    return new Response('Image not found', { status: 404, headers: noStore })
  }
  try {
    const image = await loadSvgMedia(id, filename)
    if (!image) return new Response('Image not found', { status: 404, headers: noStore })
    return svgResponse(request, image)
  } catch {
    return new Response('Image temporarily unavailable', { status: 503, headers: noStore })
  }
}
