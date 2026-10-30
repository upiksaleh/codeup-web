import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { register } from 'node:module'
import { test } from 'node:test'
import { resolveDefaultImageUrl } from 'notion-utils'

register('./page-paths-loader.mjs', import.meta.url)
const { getSvgCover, withSvgCovers } = await import('../src/lib/notion/svg-cover.ts')
const { localSvgCoverUrl } = await import('../src/lib/notion/image-source.ts')
const { siteConfig } = await import('../src/site.config.ts')
const { isReservedSlug } = await import('../src/lib/notion/urls.ts')
const rootId = siteConfig.rootNotionPageId
const pageId = '4084ac77-d51a-8114-a083-dcfc7a8c9437'
const rasterId = '4084ac77-d51a-8114-a083-dcfc7a8c9438'
const cover = 'attachment:d8853e22-f10e-418a-a435-9429c56a9fb5:kukusa_cover.svg'
const origin = `https://${siteConfig.domain}`
const block = (id, source) => ({
  role: 'reader',
  value: {
    id,
    type: 'page',
    alive: true,
    parent_id: rootId,
    parent_table: 'block',
    format: { page_cover: source },
  },
})
const fixture = () => ({
  block: {
    [rootId]: {
      role: 'reader',
      value: {
        id: rootId,
        type: 'page',
        alive: true,
        permissions: [{ type: 'public_permission', role: 'reader' }],
      },
    },
    [pageId]: block(pageId, cover),
    [rasterId]: block(rasterId, 'https://app.notion.com/image/photo.png'),
  },
  collection: {},
  collection_view: {},
  collection_query: {},
  signed_urls: {},
})

test('public SVG covers get one versioned first-party URL, while raster covers retain optimization sources', () => {
  const source = fixture()
  const before = structuredClone(source)
  const media = getSvgCover(source, pageId)
  assert.match(media.source, /^https:\/\/app\.notion\.com\/image\/attachment/)
  assert.match(media.path, /^\/media\/[a-f\d]{32}\/cover-[a-f\d]{24}\.svg$/)
  const rendered = withSvgCovers(source, origin)
  assert.equal(rendered.block[pageId].value.format.page_cover, origin + media.path)
  assert.equal(rendered.block[rasterId], source.block[rasterId])
  assert.deepEqual(source, before)
  assert.equal(localSvgCoverUrl(origin + media.path, origin), media.path)
  assert.equal(isReservedSlug('media'), true)
  source.block[pageId].value.format.page_cover = 'attachment:other:replacement.svg'
  assert.notEqual(getSvgCover(source, pageId).path, media.path)
})

test('stable cover references survive Notion mapping and Wayback replay without root URL rebasing', () => {
  const map = fixture()
  const media = getSvgCover(map, pageId)
  const page = map.block[pageId].value
  const replay = `https://web.archive.org/web/20261030122909im_/${origin}${media.path}`
  for (const value of [origin + media.path, replay]) {
    assert.equal(resolveDefaultImageUrl(value, page, { isPublic: true }), value)
  }
  assert.equal(localSvgCoverUrl(replay, origin), replay)
  assert.equal(localSvgCoverUrl(replay, replay.slice(0, -media.path.length)), replay)
  assert.equal(
    localSvgCoverUrl(`https://evil.example${media.path}`, origin),
    `https://evil.example${media.path}`,
  )
  assert.equal(
    localSvgCoverUrl(`${origin}.evil.example${media.path}`, origin),
    `${origin}.evil.example${media.path}`,
  )
})

test('cover normalization follows the existing site URL utility for branch and deployment previews', () => {
  const path = getSvgCover(fixture(), pageId).path
  const script = `
    import { register } from 'node:module'
    register(${JSON.stringify(new URL('./page-paths-loader.mjs', import.meta.url).href)})
    const { siteUrl } = await import(${JSON.stringify(new URL('../src/lib/site-url.ts', import.meta.url).href)})
    const { localSvgCoverUrl } = await import(${JSON.stringify(new URL('../src/lib/notion/image-source.ts', import.meta.url).href)})
    const path = ${JSON.stringify(path)}
    const replay = 'https://web.archive.org/web/20261030122909im_/' + siteUrl + path
    console.log(JSON.stringify({ siteUrl, path: localSvgCoverUrl(siteUrl + path, siteUrl), replay: localSvgCoverUrl(replay, siteUrl) }))
  `
  for (const [branch, deployment, expected] of [
    [
      'codeup-git-wayback-test.vercel.app',
      'codeup-unique.vercel.app',
      'codeup-git-wayback-test.vercel.app',
    ],
    ['', 'codeup-unique.vercel.app', 'codeup-unique.vercel.app'],
  ]) {
    const run = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--input-type=module', '-e', script],
      {
        env: {
          ...process.env,
          VERCEL_ENV: 'preview',
          VERCEL_BRANCH_URL: branch,
          VERCEL_URL: deployment,
        },
        encoding: 'utf8',
      },
    )
    assert.equal(run.status, 0, run.stderr)
    assert.deepEqual(JSON.parse(run.stdout), {
      siteUrl: `https://${expected}`,
      path,
      replay: `https://web.archive.org/web/20261030122909im_/https://${expected}${path}`,
    })
  }
})

test('SVG references cannot be created for non-public, deleted, invalid or disallowed sources', () => {
  assert.equal(getSvgCover(fixture(), 'invalid'), undefined)
  for (const source of [
    'https://evil.example/file.svg',
    'https://app.notion.com/private/file.svg',
    'https://user:pass@app.notion.com/image/file.svg',
  ]) {
    const map = fixture()
    map.block[pageId].value.format.page_cover = source
    assert.equal(getSvgCover(map, pageId), undefined)
  }
  const deleted = fixture()
  deleted.block[pageId].value.alive = false
  assert.equal(getSvgCover(deleted, pageId), undefined)
  const privateMap = fixture()
  privateMap.block[pageId].value.parent_id = 'unrelated'
  privateMap.block[pageId].value.permissions = [
    { type: 'user_permission', role: 'editor', user_id: 'owner' },
  ]
  assert.equal(getSvgCover(privateMap, pageId), undefined)
  assert.equal(withSvgCovers(privateMap, origin).block[pageId], privateMap.block[pageId])
})
