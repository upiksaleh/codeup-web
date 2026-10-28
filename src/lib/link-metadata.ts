import { Parser } from 'htmlparser2'
import ipaddr from 'ipaddr.js'
import type { Decoration, ExtendedRecordMap } from 'notion-types'
import { getBlockValue, getPageContentBlockIds } from 'notion-utils'

export function isPublicAddress(address: string) {
  return ipaddr.isValid(address) && ipaddr.process(address).range() === 'unicast'
}

export function parsePreviewUrl(value: string) {
  const url = new URL(value)
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (
    value.length > 2048 ||
    url.protocol !== 'https:' ||
    url.port ||
    url.username ||
    url.password ||
    !host.includes('.') ||
    host.endsWith('.local') ||
    host.endsWith('.localhost') ||
    (ipaddr.isValid(host) && !isPublicAddress(host))
  )
    throw new Error('Unsupported preview URL')
  url.hash = ''
  return url
}

export function getExternalPageLinks(recordMap: ExtendedRecordMap, pageId: string) {
  const links = new Set<string>()
  for (const id of getPageContentBlockIds(recordMap, pageId)) {
    const block = getBlockValue(recordMap.block[id])
    if (!block?.alive) continue
    for (const value of Object.values(block.properties ?? {}) as Decoration[][]) {
      for (const [, decorations] of value) {
        for (const decoration of decorations ?? []) {
          if (decoration[0] !== 'a') continue
          try {
            links.add(parsePreviewUrl(decoration[1]).href)
          } catch {
            /* Not a public web link. */
          }
        }
      }
    }
  }
  return links
}

export function parseLinkMetadata(html: string, source: string) {
  const metadata = new Map<string, string>()
  let inTitle = false
  let title = ''
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        if (name === 'title') inTitle = true
        if (name !== 'meta') return
        const key = (attributes.property || attributes.name || '').toLowerCase()
        if (key && attributes.content && !metadata.has(key)) metadata.set(key, attributes.content)
      },
      ontext(text) {
        if (inTitle) title += text
      },
      onclosetag(name) {
        if (name === 'title') inTitle = false
      },
    },
    { decodeEntities: true },
  )
  parser.end(html)
  const clean = (value: string, limit: number) => value.replace(/\s+/g, ' ').trim().slice(0, limit)
  const url = parsePreviewUrl(source)
  let image: string | undefined
  try {
    const value = metadata.get('og:image') || metadata.get('twitter:image')
    if (value) image = parsePreviewUrl(new URL(value, url).href).href
  } catch {
    /* Invalid optional images are omitted. */
  }
  return {
    url: url.href,
    hostname: url.hostname,
    title: clean(
      metadata.get('og:title') || metadata.get('twitter:title') || title || url.hostname,
      200,
    ),
    description: clean(
      metadata.get('og:description') ||
        metadata.get('twitter:description') ||
        metadata.get('description') ||
        '',
      320,
    ),
    image,
  }
}

export type LinkMetadata = ReturnType<typeof parseLinkMetadata>
