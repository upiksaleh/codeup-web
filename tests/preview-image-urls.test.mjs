import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getPreviewImageUrls } from '../src/lib/notion/preview-image-urls.ts'

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
