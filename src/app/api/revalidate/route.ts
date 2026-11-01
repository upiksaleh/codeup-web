import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { findChangedPages } from '@/lib/notion/index/changes'
import { siteIndexTag } from '@/lib/notion/index/site'
import { notionPageTag } from '@/lib/notion/pages'

// Live metadata and three gallery pages are read on each run; a cold index also needs a crawl.
export const maxDuration = 60

function isAuthorized(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  const given = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!secret || !given) return false
  const [a, b] = [Buffer.from(given), Buffer.from(secret)]
  return a.length === b.length && timingSafeEqual(a, b)
}

// Expires pages edited since caching; an index change also marks every route stale.
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  try {
    const { pageIds, indexChanged } = await findChangedPages()
    for (const id of pageIds) revalidateTag(notionPageTag(id), { expire: 0 })
    // Expiring the layout also drops every edited-time marker, so a page-only change
    // relies on its tag, which reaches each route that read the page.
    if (indexChanged) {
      revalidateTag(siteIndexTag, { expire: 0 })
      revalidatePath('/', 'layout')
    }
    return Response.json({ changed: pageIds.length }, { headers })
  } catch (error) {
    console.error('Revalidation failed', error)
    return Response.json({ error: 'Notion is unavailable' }, { status: 502, headers })
  }
}
