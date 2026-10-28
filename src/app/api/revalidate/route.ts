import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { notionPageTag } from '@/lib/notion/load-page'
import { findChangedPageIds } from '@/lib/notion/site-pages'

function isAuthorized(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  const given = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!secret || !given) return false
  const [a, b] = [Buffer.from(given), Buffer.from(secret)]
  return a.length === b.length && timingSafeEqual(a, b)
}

// Called on a schedule. Expires only pages edited in Notion since they were cached,
// then marks every route stale so links, listings, and the index pick up the change.
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  try {
    const changed = await findChangedPageIds()
    for (const id of changed) revalidateTag(notionPageTag(id), { expire: 0 })
    if (changed.length) revalidatePath('/', 'layout')
    return Response.json({ changed: changed.length }, { headers })
  } catch {
    return Response.json({ error: 'Notion is unavailable' }, { status: 502, headers })
  }
}
