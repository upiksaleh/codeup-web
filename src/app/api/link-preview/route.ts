import { getExternalLinkPreview } from '@/lib/external-link-preview'
import { getExternalPageLinks, parsePreviewUrl } from '@/lib/link-metadata'
import { loadNotionPage } from '@/lib/notion/pages'
import { normalizePageId } from '@/lib/notion/urls'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const id = normalizePageId(params.get('pageId') ?? '')
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  let url: URL
  try {
    url = parsePreviewUrl(params.get('url') ?? '')
  } catch {
    return Response.json({ error: 'Invalid preview URL' }, { status: 400, headers })
  }
  if (!id) return Response.json({ error: 'Invalid page ID' }, { status: 400, headers })
  try {
    const map = await loadNotionPage(id)
    if (!map || !getExternalPageLinks(map, id).has(url.href)) {
      return Response.json({ error: 'Link not found' }, { status: 404, headers })
    }
    return Response.json(await getExternalLinkPreview(url.href), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=60' },
    })
  } catch {
    return Response.json({ error: 'Preview unavailable' }, { status: 502, headers })
  }
}
