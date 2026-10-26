import { normalizeSearchQuery, searchSitePages } from '@/lib/notion/site-pages'

const limit = 8

export async function GET(request: Request) {
  const query = normalizeSearchQuery(new URL(request.url).searchParams.get('q'))
  const pages = await searchSitePages(query)

  return Response.json(
    {
      total: pages.length,
      results: pages.slice(0, limit).map(({ id, url, title, description }) => ({
        id,
        url,
        title,
        description,
      })),
    },
    { headers: { 'Cache-Control': 'public, max-age=60', 'X-Robots-Tag': 'noindex' } },
  )
}
