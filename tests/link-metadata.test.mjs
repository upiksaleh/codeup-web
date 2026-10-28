import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getExternalPageLinks,
  isPublicAddress,
  parseLinkMetadata,
  parsePreviewUrl,
} from '../src/lib/link-metadata.ts'

test('preview URLs reject local networks, credentials, unsupported schemes and ports', () => {
  for (const address of [
    '127.0.0.1',
    '10.0.0.1',
    '172.16.1.1',
    '192.168.1.1',
    '169.254.169.254',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ]) {
    assert.equal(isPublicAddress(address), false, address)
  }
  assert.equal(isPublicAddress('1.1.1.1'), true)
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true)
  for (const url of [
    'http://example.com',
    'https://localhost/',
    'https://0x7f000001/',
    'https://127.1/',
    'https://[::1]/',
    'https://192.168.0.1/',
    'https://user:secret@example.com/',
    'https://example.com:8443/',
    'file:///etc/passwd',
  ]) {
    assert.throws(() => parsePreviewUrl(url), undefined, url)
  }
  assert.equal(
    parsePreviewUrl('https://example.com/path?q=1#section').href,
    'https://example.com/path?q=1',
  )
})

test('metadata uses Open Graph, decodes entities and resolves optional images safely', () => {
  const result = parseLinkMetadata(
    `<head><title>Fallback</title>
    <meta content='Streaming &amp; architecture' property='og:title'>
    <meta name="description" content="Fallback summary">
    <meta property="og:description" content="  Original\n summary  ">
    <meta property="og:image" content="../cover.png">
    </head>`,
    'https://example.com/docs/streaming/',
  )
  assert.equal(result.title, 'Streaming & architecture')
  assert.equal(result.description, 'Original summary')
  assert.equal(result.image, 'https://example.com/docs/cover.png')
  const fallback = parseLinkMetadata(
    '<title>Plain title</title><meta property="og:image" content="http://127.0.0.1/x">',
    'https://example.com',
  )
  assert.equal(fallback.title, 'Plain title')
  assert.equal(fallback.image, undefined)
  assert.equal(parseLinkMetadata('', 'https://example.com').title, 'example.com')
})

test('only real rich text links in the rendered page authorize metadata requests', () => {
  const block = (id, type, content, title) => ({
    value: { id, type, content, alive: true, properties: { title } },
  })
  const map = {
    block: {
      root: block('root', 'page', ['text', 'child'], [['Root']]),
      text: block(
        'text',
        'text',
        [],
        [
          ['Docs', [['a', 'https://example.com/docs/#part']]],
          ['Local', [['a', 'https://127.0.0.1/']]],
        ],
      ),
      child: block('child', 'page', ['hidden'], [['Child']]),
      hidden: block('hidden', 'text', [], [['Other', [['a', 'https://other.example/']]]]),
    },
  }
  assert.deepEqual([...getExternalPageLinks(map, 'root')], ['https://example.com/docs/'])
})
