import assert from 'node:assert/strict'
import { test } from 'node:test'
import { memoizeAsync } from '../src/lib/memoize-async.ts'
import { getPreviewImageUrls } from '../src/lib/notion/preview-image-urls.ts'

test('concurrent callers share work and resolved values expire', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 })
  let calls = 0
  let finish
  const load = memoizeAsync(
    () => {
      calls++
      return new Promise((resolve) => {
        finish = resolve
      })
    },
    { ttl: 100, maxEntries: 2 },
  )
  const first = load('page')
  assert.equal(load('page'), first)
  await Promise.resolve()
  assert.equal(calls, 1)
  finish('result')
  assert.equal(await first, 'result')
  assert.equal(await load('page'), 'result')
  t.mock.timers.setTime(1100)
  const refreshed = load('page')
  await Promise.resolve()
  assert.equal(calls, 2)
  finish('fresh')
  assert.equal(await refreshed, 'fresh')
})

test('failures are retried, null is cached, and capacity is bounded', async () => {
  let calls = 0
  const load = memoizeAsync(
    async (key) => {
      calls++
      if (calls === 1) throw new Error('Network failure')
      return key === 'missing' ? null : key
    },
    { ttl: 1000, maxEntries: 2 },
  )
  await assert.rejects(load('page'), /Network failure/)
  assert.equal(await load('page'), 'page')
  assert.equal(await load('missing'), null)
  assert.equal(await load('missing'), null)
  assert.equal(calls, 3)
  await load('other')
  await load('page')
  assert.equal(calls, 5)
})

const page = (id, content = []) => ({
  value: {
    id,
    type: 'page',
    alive: true,
    content,
    format: { page_cover: `https://example.com/${id}.jpg` },
  },
})
const map = {
  block: {
    root: page('root', ['gallery', 'child']),
    child: page('child', ['hidden']),
    hidden: {
      value: {
        id: 'hidden',
        type: 'image',
        properties: { source: [['https://example.com/hidden.jpg']] },
      },
    },
    gallery: {
      value: {
        id: 'gallery',
        type: 'collection_view',
        collection_id: 'collection',
        view_ids: ['view'],
      },
    },
    item: page('item'),
    unrelated: page('unrelated'),
  },
  collection: {},
  collection_view: {},
  collection_query: { collection: { view: { collection_group_results: { blockIds: ['item'] } } } },
  signed_urls: {},
}

test('previews include page content and gallery results without unrelated page bodies', () => {
  assert.deepEqual(getPreviewImageUrls(map, 'root'), [
    'https://example.com/root.jpg',
    'https://example.com/child.jpg',
    'https://example.com/item.jpg',
  ])
})

test('listing previews stay in their selected collection', () => {
  assert.deepEqual(getPreviewImageUrls(map, 'gallery'), ['https://example.com/item.jpg'])
})
