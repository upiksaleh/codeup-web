import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

register('./page-paths-loader.mjs', import.meta.url)
const { getPreviewImageUrls } = await import('../src/lib/notion/preview-image-urls.ts')
const { withRenderedBlocks } = await import('../src/lib/notion/rendered-blocks.ts')

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
    item: {
      value: {
        ...page('item', ['itemBody']).value,
        properties: { related: [['‣', [['p', 'mentioned']]]] },
      },
    },
    itemBody: { value: { id: 'itemBody', type: 'text', parent_id: 'item', parent_table: 'block' } },
    mentioned: { value: { id: 'mentioned', type: 'page', alive: true } },
    unrelated: page('unrelated'),
  },
  collection: {},
  collection_view: {},
  collection_query: { collection: { view: { collection_group_results: { blockIds: ['item'] } } } },
  signed_urls: {
    hidden: 'https://example.com/hidden-signed.jpg',
    itemBody: 'https://example.com/body.jpg',
  },
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

test('the client copy keeps rendered blocks and drops card bodies and unrelated pages', () => {
  const { block, signed_urls } = withRenderedBlocks(map, 'root')
  assert.deepEqual(Object.keys(block).sort(), ['child', 'gallery', 'item', 'mentioned', 'root'])
  assert.deepEqual(signed_urls, {})
})

test('the client copy keeps the ancestors of a rendered block', () => {
  const nested = {
    ...map,
    block: {
      ...map.block,
      gallery: { value: { ...map.block.gallery.value, parent_id: 'root', parent_table: 'block' } },
    },
  }
  assert.deepEqual(Object.keys(withRenderedBlocks(nested, 'gallery').block).sort(), [
    'gallery',
    'item',
    'mentioned',
    'root',
  ])
})
