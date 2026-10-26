import { siteConfig } from '@/site.config'
import { getPageUrl, resolvePageId } from './page-url'

const reservedSlugs = new Set(['about', 'feed', 'search', 'blog', 'project', 'opengraph-image'])
const prefixes = { article: '/blog', project: '/project', note: '', page: '' } as const

type PagePathInfo = { id: string; slug: string; kind: keyof typeof prefixes }

export function isSupportedPagePath(path: string) {
  const segments = path.split('/')
  return (
    segments.length <= 2 &&
    segments.every(
      (segment) => segment.length <= 200 && /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(segment),
    ) &&
    (segments.length === 1 || segments[0] === 'blog' || segments[0] === 'project')
  )
}

export function isReservedSlug(segment: string) {
  return reservedSlugs.has(segment)
}

// Slugs only need to be unique within their database's URL namespace.
export function withPageUrls<T extends PagePathInfo>(pages: T[]) {
  const candidate = (page: T) => `${prefixes[page.kind]}/${page.slug}`
  const counts = new Map<string, number>()
  for (const page of pages) {
    if (page.slug) counts.set(candidate(page), (counts.get(candidate(page)) ?? 0) + 1)
  }

  return pages.map((page) => {
    const navigation = siteConfig.navigation.find(({ pageId }) => pageId === page.id)
    const prefix = prefixes[page.kind]
    const usesSlug =
      page.slug &&
      counts.get(candidate(page)) === 1 &&
      page.slug !== 'opengraph-image' &&
      (prefix || (!resolvePageId(page.slug) && !isReservedSlug(page.slug)))
    const fallback = prefix ? `${prefix}/${page.id.replaceAll('-', '')}` : getPageUrl(page.id)

    return { ...page, url: navigation?.path ?? (usesSlug ? candidate(page) : fallback) }
  })
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

  if (segments.length === 2) {
    const [category, slug] = segments
    if (category !== 'blog' && category !== 'project') return
    const id = resolvePageId(slug)
    return pages.find((page) => page.id === id && prefixes[page.kind] === `/${category}`)?.id
  }

  // A legacy flat slug redirects only if it identifies exactly one page.
  const matches = pages.filter(({ slug }) => slug === path)
  if (matches.length === 1) return matches[0].id
}
