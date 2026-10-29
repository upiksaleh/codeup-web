import { loadNotionPage } from '@/lib/notion/pages'
import { normalizePageId } from '@/lib/notion/urls'
import { selectPagePreview } from '@/lib/notion/page-preview'

export async function GET(request: Request) {
  const id = normalizePageId(new URL(request.url).searchParams.get('id') ?? '')
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  if (!id) return Response.json({ error: 'Invalid page ID' }, { status: 400, headers })

  try {
    const recordMap = await loadNotionPage(id)
    const preview = recordMap && selectPagePreview(recordMap, id)
    if (!preview) return Response.json({ error: 'Page not found' }, { status: 404, headers })
    return Response.json(preview, {
      headers: { ...headers, 'Cache-Control': 'public, max-age=60' },
    })
  } catch {
    return Response.json({ error: 'Preview unavailable' }, { status: 503, headers })
  }
}
