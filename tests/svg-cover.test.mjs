import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { register } from 'node:module'
import { test } from 'node:test'
import { resolveDefaultImageUrl } from 'notion-utils'

register('./page-paths-loader.mjs', import.meta.url)
const { getSvgCover, withSvgMedia } = await import('../src/lib/notion/svg-media.ts')
const { localSvgMediaUrl } = await import('../src/lib/notion/image-source.ts')
const { siteConfig } = await import('../src/site.config.ts')
const { isReservedSlug } = await import('../src/lib/notion/urls.ts')
const { getNotionIconPath } = await import('../src/lib/notion/icon-url.ts')
const { isSvgImage } = await import('../src/lib/notion/image-source.ts')
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
  const rendered = withSvgMedia(source, origin)
  assert.equal(rendered.block[pageId].value.format.page_cover, origin + media.path)
  assert.equal(rendered.block[rasterId], source.block[rasterId])
  assert.deepEqual(source, before)
  assert.equal(localSvgMediaUrl(origin + media.path, origin), media.path)
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
  assert.equal(localSvgMediaUrl(replay, origin), replay)
  assert.equal(localSvgMediaUrl(replay, replay.slice(0, -media.path.length)), replay)
  assert.equal(
    localSvgMediaUrl(`https://evil.example${media.path}`, origin),
    `https://evil.example${media.path}`,
  )
  assert.equal(
    localSvgMediaUrl(`${origin}.evil.example${media.path}`, origin),
    `${origin}.evil.example${media.path}`,
  )
})

test('cover normalization follows the existing site URL utility for branch and deployment previews', () => {
  const path = getSvgCover(fixture(), pageId).path
  const script = `
    import { register } from 'node:module'
    register(${JSON.stringify(new URL('./page-paths-loader.mjs', import.meta.url).href)})
    const { siteUrl } = await import(${JSON.stringify(new URL('../src/lib/site-url.ts', import.meta.url).href)})
    const { localSvgMediaUrl } = await import(${JSON.stringify(new URL('../src/lib/notion/image-source.ts', import.meta.url).href)})
    const path = ${JSON.stringify(path)}
    const replay = 'https://web.archive.org/web/20261030122909im_/' + siteUrl + path
    console.log(JSON.stringify({ siteUrl, path: localSvgMediaUrl(siteUrl + path, siteUrl), replay: localSvgMediaUrl(replay, siteUrl) }))
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
  assert.equal(withSvgMedia(privateMap, origin).block[pageId], privateMap.block[pageId])
})

test('database covers inherit public access through collection ancestry, independent of temporary signatures', () => {
  const map = fixture()
  const collectionId = siteConfig.articleCollectionId
  const databaseId = siteConfig.articlesDatabaseId
  const article = map.block[pageId].value
  article.parent_table = 'collection'
  article.parent_id = collectionId
  article.permissions = [{ type: 'user_permission', role: 'editor', user_id: 'owner' }]
  map.collection[collectionId] = {
    role: 'reader',
    value: {
      id: collectionId,
      parent_table: 'block',
      parent_id: databaseId,
    },
  }
  map.block[databaseId] = block(databaseId)
  const prefix =
    'https://file.notion.com/f/f/0334ac77-d51a-816c-b20d-0003b543bf8b/25578707-7677-45a4-bd07-681ccffc2e9e/cover_2.svg'
  article.format.page_cover = prefix + '?expirationTimestamp=1&signature=expired'
  const first = getSvgCover(map, pageId)
  assert.ok(first)
  assert.match(first.source, /app\.notion\.com\/image\/attachment/)
  assert.doesNotMatch(first.source, /signature|expirationTimestamp/)
  article.format.page_cover = prefix + '?expirationTimestamp=9999999999999&signature=renewed'
  assert.deepEqual(getSvgCover(map, pageId), first)
  map.signed_urls[pageId] = article.format.page_cover
  map.signed_urls[rasterId] = 'https://example.com/preserve-other-signatures'
  const rendered = withSvgMedia(map, origin)
  const renderedCover = rendered.block[pageId].value.format.page_cover
  assert.equal(renderedCover, origin + first.path)
  assert.equal(
    resolveDefaultImageUrl(renderedCover, rendered.block[pageId].value, {
      isPublic: false,
      signedUrls: rendered.signed_urls,
    }),
    origin + first.path,
  )
  assert.equal(map.signed_urls[pageId], article.format.page_cover)
  assert.equal(rendered.signed_urls[pageId], undefined)
  assert.equal(rendered.signed_urls[rasterId], map.signed_urls[rasterId])
  map.block[rootId].value.permissions = [
    { type: 'user_permission', role: 'editor', user_id: 'owner' },
  ]
  assert.equal(getSvgCover(map, pageId), undefined)
  map.block[databaseId].value.permissions = [{ type: 'public_permission', role: 'reader' }]
  assert.ok(getSvgCover(map, pageId))
  delete map.collection[collectionId]
  assert.equal(getSvgCover(map, pageId), undefined)
})

test('Notion page, callout and collection icons use shared SVG URLs with explicit light/dark variants', () => {
  const map = fixture()
  const icon = '/icons/verified_orange.svg'
  const iconPath = '/media/icons/verified_orange.svg'
  map.block[pageId].value.format.page_icon = icon
  const calloutId = '4084ac77-d51a-8114-a083-dcfc7a8c9440'
  map.block[calloutId] = {
    ...block(calloutId),
    value: {
      ...block(calloutId).value,
      type: 'callout',
      format: { page_icon: '/icons/key_gray.svg' },
    },
  }
  map.collection.collection = {
    role: 'reader',
    value: { id: 'collection', parent_table: 'block', parent_id: rootId, icon },
  }
  const original = structuredClone(map)
  const rendered = withSvgMedia(map, origin)
  assert.equal(rendered.block[pageId].value.format.page_icon, origin + iconPath)
  assert.equal(
    rendered.block[calloutId].value.format.page_icon,
    origin + '/media/icons/key_gray.svg',
  )
  assert.equal(rendered.collection.collection.value.icon, origin + iconPath)
  assert.deepEqual(map, original)
  assert.equal(localSvgMediaUrl(origin + iconPath, origin), iconPath + '?mode=light')
  assert.equal(localSvgMediaUrl(origin + iconPath, origin, true), iconPath + '?mode=dark')
  const replay = 'https://web.archive.org/web/20261030142810im_/' + origin + iconPath
  assert.equal(localSvgMediaUrl(replay, origin, true), replay + '?mode=dark')
  assert.equal(
    localSvgMediaUrl(replay, replay.slice(0, -iconPath.length), true),
    replay + '?mode=dark',
  )
  assert.equal(getNotionIconPath(icon), iconPath)
  for (const value of [
    'https://evil.example/icons/file.svg',
    'https://user:pass@app.notion.com/icons/file.svg',
    '/icons/../private.svg',
    '/icons/file.png',
  ]) {
    assert.equal(getNotionIconPath(value), undefined)
  }
  assert.ok(isSvgImage('https://app.notion.com/icons/verified_orange.svg?mode=dark'))
  assert.ok(isSvgImage(origin + iconPath))
  assert.equal(isSvgImage('https://app.notion.com/image/photo.png'), false)
})
