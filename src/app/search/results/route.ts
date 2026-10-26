import { getRecentPages, normalizeSearchQuery, searchSitePages } from '@/lib/notion/search'

const limit = 8

export async function GET(request: Request) {
  const query = normalizeSearchQuery(new URL(request.url).searchParams.get('q'))
  const results = query ? await searchSitePages(query) : await getRecentPages(limit)

  return Response.json(
    { query, total: results.length, results: results.slice(0, limit) },
    { headers: { 'Cache-Control': 'public, max-age=60', 'X-Robots-Tag': 'noindex' } },
  )
}
