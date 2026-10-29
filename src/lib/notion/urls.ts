import { idToUuid } from 'notion-utils'
import { siteConfig } from '@/site.config'

const reservedSlugs = new Set(['about', 'articles', 'feed', 'search', 'article', 'blog', 'project'])
const prefixes = { article: '/article', project: '/project', note: '', page: '' } as const
const configuredPages = [...siteConfig.navigation, ...siteConfig.pageAliases]

type PagePathInfo = { id: string; slug: string; kind: keyof typeof prefixes; parentId?: string }

export function normalizePageId(value: string) {
  if (!/^(?:[a-f\d]{32}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i.test(value)) {
    return undefined
  }
  return idToUuid(value.replaceAll('-', '').toLowerCase())
}

export function findConfiguredPath(pageId: string) {
  return configuredPages.find((page) => page.pageId === pageId)?.path
}

// Configured path, bare ID, or `title-<id>` segment.
export function resolvePageId(segment: string) {
  return (
    configuredPages.find(({ path }) => path === `/${segment}`)?.pageId ??
    normalizePageId(segment) ??
    normalizePageId(segment.match(/^.+-([a-f\d]{32})$/i)?.[1] ?? '')
  )
}

export function getDefaultPageUrl(pageId: string) {
  const id = resolvePageId(pageId)
  if (!id) return `https://www.notion.so/${encodeURIComponent(pageId)}`
  return findConfiguredPath(id) ?? `/${id.replaceAll('-', '')}`
}

export function isSupportedPagePath(path: string) {
  const segments = path.split('/')
  return (
    segments.every(
      (segment) => segment.length <= 200 && /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(segment),
    ) &&
    (segments.length === 1 || segments[0] === 'article' || segments[0] === 'project')
  )
}

export function isReservedSlug(segment: string) {
  return reservedSlugs.has(segment)
}

// Slugs are unique per database or parent page; duplicates fall back to IDs.
export function withPageUrls<T extends PagePathInfo>(pages: T[]) {
  const byId = new Map(pages.map((page) => [page.id, page]))
  const nestedParents = new Map<string, T>()
  for (const page of pages) {
    if (prefixes[page.kind]) continue
    const visited = new Set([page.id])
    let ancestor = page.parentId ? byId.get(page.parentId) : undefined
    while (ancestor && !visited.has(ancestor.id)) {
      if (prefixes[ancestor.kind]) {
        nestedParents.set(page.id, byId.get(page.parentId!)!)
        break
      }
      visited.add(ancestor.id)
      ancestor = ancestor.parentId ? byId.get(ancestor.parentId) : undefined
    }
  }
  const candidate = (page: T) =>
    `${nestedParents.get(page.id)?.id ?? prefixes[page.kind]}/${page.slug}`
  const counts = new Map<string, number>()
  for (const page of pages) {
    if (page.slug) counts.set(candidate(page), (counts.get(candidate(page)) ?? 0) + 1)
  }

  const urls = new Map<string, string>()
  function getUrl(page: T): string {
    const existing = urls.get(page.id)
    if (existing) return existing
    const parent = nestedParents.get(page.id)
    const prefix = parent ? getUrl(parent) : prefixes[page.kind]
    const usesSlug =
      page.slug &&
      counts.get(candidate(page)) === 1 &&
      (prefix || (!resolvePageId(page.slug) && !isReservedSlug(page.slug)))
    const fallback = prefix
      ? `${prefix}/${page.id.replaceAll('-', '')}`
      : getDefaultPageUrl(page.id)

    const url = findConfiguredPath(page.id) ?? (usesSlug ? `${prefix}/${page.slug}` : fallback)
    urls.set(page.id, url)
    return url
  }
  return pages.map((page) => ({ ...page, url: getUrl(page) }))
}

export function findPageIdByPath(path: string, pages: (PagePathInfo & { url: string })[]) {
  if (!isSupportedPagePath(path)) return
  const segments = path.split('/')

  if (segments.length === 1) {
    const id = resolvePageId(path)
    if (id) return id
    if (isReservedSlug(path)) return
  }

  const canonical = pages.find(({ url }) => url === `/${path}`)
  if (canonical) return canonical.id

  if (segments.length >= 2) {
    const category = segments[0]
    let parent: (typeof pages)[number] | undefined
    for (const [index, segment] of segments.slice(1).entries()) {
      const id = resolvePageId(segment)
      const matches = pages.filter(
        (page) =>
          (index === 0 ? prefixes[page.kind] === `/${category}` : page.parentId === parent?.id) &&
          (page.id === id || page.slug === segment),
      )
      if (matches.length !== 1) return
      parent = matches[0]
    }
    return parent?.id
  }

  // Legacy flat slugs redirect only when unambiguous.
  const matches = pages.filter(({ slug }) => slug === path)
  if (matches.length === 1) return matches[0].id
}
