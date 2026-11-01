import assert from 'node:assert/strict'
import { register } from 'node:module'
import { beforeEach, test } from 'node:test'

register('./page-paths-loader.mjs', import.meta.url)
register('./revalidate-loader.mjs', import.meta.url)
const { unstable_cache, revalidateTag, revalidated, resetCache } =
  await import('./fakes/next-cache.mjs')
const { notion, requests } = await import('./fakes/notion-client.mjs')
const { index } = await import('./fakes/site-index.mjs')
const { siteConfig } = await import('../src/site.config.ts')
const { getCachedEditedTime, loadNotionPage, notionPageTag } =
  await import('../src/lib/notion/pages.ts')
const { POST } = await import('../src/app/api/revalidate/route.ts')

const root = siteConfig.rootNotionPageId
const galleries = [siteConfig.articlesDatabaseId, siteConfig.projectsDatabaseId]
const block = (id, parentId) => ({
  id,
  type: id === root ? 'page' : 'collection_view_page',
  alive: true,
  parent_id: parentId,
  parent_table: 'block',
  related: id === root ? [] : [root],
})
const call = (secret = 'secret') =>
  POST(
    new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
    }),
  )

process.env.REVALIDATE_SECRET = 'secret'

beforeEach(() => {
  resetCache()
  requests.length = 0
  notion.fail = false
  notion.pages = new Map([[root, block(root)], ...galleries.map((id) => [id, block(id, root)])])
  notion.edited = new Map([root, ...galleries].map((id) => [id, 100]))
  index.pages = [root, ...galleries].map((id) => ({ id, lastEdited: 100 }))
})

test('a cold marker is read without downloading the page, even inside another cache', async () => {
  assert.equal(await getCachedEditedTime(root), null)
  assert.equal(await unstable_cache(() => getCachedEditedTime(root), ['outer'])(), null)
  assert.deepEqual(requests, [])
})

test('reading a page fills its marker, also from inside another cache', async () => {
  await loadNotionPage(root)
  assert.equal(await getCachedEditedTime(root), 100)

  await unstable_cache(() => loadNotionPage(galleries[0]), ['outer'])()
  assert.equal(await getCachedEditedTime(galleries[0]), 100)
})

test('the page tag expires the record map and its marker together', async () => {
  await loadNotionPage(root)
  revalidateTag(notionPageTag(root))
  assert.equal(await getCachedEditedTime(root), null)
  requests.length = 0
  await loadNotionPage(root)
  assert.deepEqual(requests, [`getPage:${root}`])
})

test('the endpoint rejects a wrong secret', async () => {
  assert.equal((await call('wrong')).status, 401)
})

test('unchanged pages are left cached', async () => {
  for (const id of [root, ...galleries]) await loadNotionPage(id)
  const response = await call()
  assert.deepEqual(await response.json(), { changed: 0 })
  assert.deepEqual(revalidated, { tags: [], paths: [] })
})

test('an unknown marker expires only that page', async () => {
  for (const id of galleries) await loadNotionPage(id)
  assert.deepEqual(await (await call()).json(), { changed: 1 })
  assert.deepEqual(revalidated, { tags: [notionPageTag(root)], paths: [] })
})

test('an edit newer than the page cache and index expires both', async () => {
  for (const id of [root, ...galleries]) await loadNotionPage(id)
  notion.edited.set(galleries[1], 200)
  assert.deepEqual(await (await call()).json(), { changed: 1 })
  assert.deepEqual(revalidated, {
    tags: [notionPageTag(galleries[1]), 'notion:index'],
    paths: ['/:layout'],
  })
})

test('Notion failures are logged and answer 502 without caching the response', async (t) => {
  const log = t.mock.method(console, 'error', () => {})
  notion.fail = true
  const response = await call()
  assert.equal(log.mock.callCount(), 1)
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})
