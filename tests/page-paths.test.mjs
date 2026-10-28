import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

register('./page-paths-loader.mjs', import.meta.url)
const { withPageUrls, resolveSitePageId, isSupportedPagePath } =
  await import('../src/lib/notion/page-paths.ts')
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const page = (n, slug, kind = 'page', parentId) => ({ id: id(n), slug, kind, parentId })

test('entry descendants inherit their actual ancestry and slugs are unique per parent', () => {
  const pages = withPageUrls([
    page(2, 'logo-concept', 'page', id(1)),
    page(1, 'privyx', 'project'),
    page(3, 'details', 'page', id(2)),
    page(4, 'other', 'project'),
    page(5, 'logo-concept', 'page', id(4)),
    page(6, 'article', 'article'),
    page(7, 'details', 'page', id(6)),
    page(8, 'ordinary'),
  ])
  const url = (n) => pages.find((p) => p.id === id(n)).url
  assert.equal(url(2), '/project/privyx/logo-concept')
  assert.equal(url(3), '/project/privyx/logo-concept/details')
  assert.equal(url(5), '/project/other/logo-concept')
  assert.equal(url(7), '/article/article/details')
  assert.equal(url(8), '/ordinary')
  assert.equal(resolveSitePageId('project/privyx/logo-concept', pages), id(2))
  assert.equal(resolveSitePageId(`project/privyx/${id(2).replaceAll('-', '')}`, pages), id(2))
  assert.equal(resolveSitePageId('project/other/details', pages), undefined)
  assert.equal(resolveSitePageId('article/privyx/logo-concept', pages), undefined)
  assert.equal(resolveSitePageId('project/privyx/missing', pages), undefined)
  assert.equal(resolveSitePageId('details', pages), undefined)
})

test('duplicate sibling slugs use IDs and legacy URLs resolve only when unambiguous', () => {
  const pages = withPageUrls([
    page(1, 'entry', 'project'),
    page(2, 'same', 'page', id(1)),
    page(3, 'same', 'page', id(1)),
    page(4, 'unique', 'page', id(1)),
    page(5, 'opengraph-image', 'page', id(1)),
  ])
  assert.equal(pages[1].url, `/project/entry/${id(2).replaceAll('-', '')}`)
  assert.equal(pages[4].url, `/project/entry/${id(5).replaceAll('-', '')}`)
  assert.equal(resolveSitePageId('project/entry/same', pages), undefined)
  assert.equal(resolveSitePageId('same', pages), undefined)
  assert.equal(resolveSitePageId('unique', pages), id(4))
  assert.equal(resolveSitePageId(id(4), pages), id(4))
  assert.equal(isSupportedPagePath('project/entry/child/grandchild'), true)
  for (const path of [
    'project//child',
    'project/../child',
    'projects/entry/child',
    'article/entry/child?x=1',
  ]) {
    assert.equal(isSupportedPagePath(path), false)
  }
})

test('cycles and missing parents cannot create nested canonical URLs', () => {
  const pages = withPageUrls([
    page(1, 'first', 'page', id(2)),
    page(2, 'second', 'page', id(1)),
    page(3, 'missing', 'page', id(9)),
  ])
  assert.deepEqual(
    pages.map((p) => p.url),
    ['/first', '/second', '/missing'],
  )
})
