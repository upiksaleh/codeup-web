import { siteConfig } from '@/site.config'
import { getPageUrl, resolvePageId } from './page-url'

const reservedSlugs = new Set([
  'about',
  'articles',
  'feed',
  'search',
  'article',
  'blog',
  'project',
  'opengraph-image',
])
const prefixes = { article: '/article', project: '/project', note: '', page: '' } as const

type PagePathInfo = { id: string; slug: string; kind: keyof typeof prefixes; parentId?: string }

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

// Slugs are unique within their database namespace or parent page.
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
    const configuredPage = [...siteConfig.navigation, ...siteConfig.pageAliases].find(
      ({ pageId }) => pageId === page.id,
    )
    const parent = nestedParents.get(page.id)
    const prefix = parent ? getUrl(parent) : prefixes[page.kind]
    const usesSlug =
      page.slug &&
      counts.get(candidate(page)) === 1 &&
      page.slug !== 'opengraph-image' &&
      (prefix || (!resolvePageId(page.slug) && !isReservedSlug(page.slug)))
    const fallback = prefix ? `${prefix}/${page.id.replaceAll('-', '')}` : getPageUrl(page.id)

    const url = configuredPage?.path ?? (usesSlug ? `${prefix}/${page.slug}` : fallback)
    urls.set(page.id, url)
    return url
  }
  return pages.map((page) => ({ ...page, url: getUrl(page) }))
}

export function resolveSitePageId(path: string, pages: (PagePathInfo & { url: string })[]) {
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

  // A legacy flat slug redirects only if it identifies exactly one page.
  const matches = pages.filter(({ slug }) => slug === path)
  if (matches.length === 1) return matches[0].id
}
