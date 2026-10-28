import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getBlockValue } from 'notion-utils'
import { selectPagePreview } from '../src/lib/notion/page-preview.ts'

const entry = (id, type, content = [], parent_id = 'target') => ({
  value: {
    value: { id, type, content, parent_id, alive: true, properties: { title: [[id]] } },
  },
})

test('page previews preserve rich text and image blocks without unrelated page contents', () => {
  const richText = [['Original', [['b']]]]
  const map = {
    block: {
      root: entry('root', 'page', ['target', 'other'], ''),
      target: entry('target', 'page', ['text', 'image', 'child', 'code', 'extra'], 'root'),
      text: entry('text', 'text'),
      image: entry('image', 'image'),
      child: entry('child', 'page', ['hidden']),
      hidden: entry('hidden', 'text', [], 'child'),
      code: entry('code', 'code'),
      extra: entry('extra', 'text'),
      other: entry('other', 'page'),
    },
    collection: {},
    signed_urls: { image: 'https://example.com/image', other: 'https://example.com/other' },
  }
  getBlockValue(map.block.text).properties.title = richText
  const preview = selectPagePreview(map, 'target')
  assert.deepEqual(preview.blockIds, ['text', 'image', 'code'])
  assert.deepEqual(getBlockValue(preview.recordMap.block.text).properties.title, richText)
  assert.equal(getBlockValue(preview.recordMap.block.image).type, 'image')
  assert.deepEqual(Object.keys(preview.recordMap.block).sort(), [
    'code',
    'image',
    'root',
    'target',
    'text',
  ])
  assert.deepEqual(getBlockValue(preview.recordMap.block.root).content, [])
  assert.deepEqual(preview.recordMap.signed_urls, { image: 'https://example.com/image' })
  assert.equal(getBlockValue(map.block.target).content.length, 5)
})

test('nested preview content is bounded and cyclic blocks cannot recurse forever', () => {
  const map = { block: { target: entry('target', 'page', ['list']) }, collection: {} }
  map.block.list = entry('list', 'bulleted_list', [
    'list',
    ...Array.from({ length: 40 }, (_, i) => `item${i}`),
  ])
  for (let i = 0; i < 40; i++) map.block[`item${i}`] = entry(`item${i}`, 'bulleted_list')
  const preview = selectPagePreview(map, 'target')
  assert.equal(Object.keys(preview.recordMap.block).length, 17)
  assert.equal(getBlockValue(preview.recordMap.block.list).content.length, 15)
  assert.equal(selectPagePreview(map, 'missing'), undefined)
})
