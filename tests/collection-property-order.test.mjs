import assert from 'node:assert/strict'
import { test } from 'node:test'
import { withCollectionPropertyOrder } from '../src/lib/notion/collection-property-order.ts'

test('incomplete Notion property order gives every rendered row a finite sort index', () => {
  const properties = [
    { property: 'tags', visible: true },
    { property: 'published', visible: true },
    { property: 'author', visible: false },
  ]
  const value = {
    id: 'articles',
    schema: {
      tags: { name: 'Tags' },
      author: { name: 'Author' },
      internal: { name: 'meta_hide_icon_on_card' },
      published: { name: 'Published' },
      title: { name: 'Name' },
    },
    format: {
      collection_page_properties: properties,
      property_visibility: [{ property: 'author', visibility: 'hide_if_empty' }],
    },
  }
  const map = { collection: { articles: { role: 'reader', value: { value } } } }
  const result = withCollectionPropertyOrder(map)
  const normalized = result.collection.articles.value
  const order = normalized.format.collection_page_properties
  const indexes = Object.fromEntries(order.map(({ property }, index) => [property, index]))
  const ids = Object.keys(normalized.schema).filter((id) => id !== 'title')
  for (const a of ids) {
    for (const b of ids) assert.ok(Number.isFinite(indexes[a] - indexes[b]))
  }
  assert.deepEqual(
    ids.sort((a, b) => indexes[a] - indexes[b]),
    ['tags', 'published', 'author', 'internal'],
  )
  assert.deepEqual(order.slice(0, 3), properties)
  assert.equal(normalized.format.property_visibility, value.format.property_visibility)
  assert.equal(map.collection.articles.value.value, value)
  assert.equal(value.format.collection_page_properties.length, 3)
  assert.deepEqual(withCollectionPropertyOrder(result), result)
})

test('collections without an explicit property order keep the renderer default', () => {
  const entry = { value: { id: 'pages', schema: { title: { name: 'Name' } } } }
  const map = { collection: { pages: entry } }
  assert.equal(withCollectionPropertyOrder(map).collection.pages, entry)
})
