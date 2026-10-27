import 'server-only'

import { getSearchTerms, getTermPattern } from '@/lib/search-terms'
import { siteConfig } from '@/site.config'
import { getSitePages } from './site-pages'

type SitePage = Awaited<ReturnType<typeof getSitePages>>[number]

export type SearchResult = {
  id: string
  url: string
  title: string
  description: string
  label: string
  snippet: string
}

const kindLabels = { article: 'Article', project: 'Project', note: 'Note', page: 'Page' }

export function normalizeSearchQuery(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 200) : ''
}

function getLabel(page: SitePage) {
  if (page.kind !== 'article') return kindLabels[page.kind]
  return new Date(page.published).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// A short excerpt around the first term found in the page body.
function getSnippet(content: string, terms: string[]) {
  const index = content.search(getTermPattern(terms))
  if (index === -1) return ''

  const start = Math.max(0, content.lastIndexOf(' ', Math.max(0, index - 48)) + 1)
  const end = content.indexOf(' ', Math.min(content.length, index + 110))
  const excerpt = content.slice(start, end === -1 ? undefined : end).trim()
  return `${start > 0 ? '…' : ''}${excerpt}${end === -1 ? '' : '…'}`
}

function toResult(page: SitePage, snippet = ''): SearchResult {
  const { id, url, title, description } = page
  return { id, url, title, description, label: getLabel(page), snippet }
}

function getRecency(page: SitePage) {
  return page.kind === 'article' ? page.published : page.lastEdited
}

// Every term must match. Title hits weigh most, then tags and descriptions, then body text.
export async function searchSitePages(query: string): Promise<SearchResult[]> {
  const terms = getSearchTerms(query)
  if (!terms.length) return []
  const patterns = terms.map((term) => getTermPattern([term]))

  return (await getSitePages())
    .map((page) => {
      const meta = `${page.description} ${page.tags.join(' ')}`
      let score = 0
      let inMeta = true

      for (const pattern of patterns) {
        const titleAt = page.title.search(pattern)
        if (titleAt !== -1) score += titleAt === 0 ? 12 : 8
        else if (pattern.test(meta)) score += 4
        else if (pattern.test(page.content)) {
          score += 1
          inMeta = false
        } else return null
      }

      return { page, score, snippet: inMeta ? '' : getSnippet(page.content, terms) }
    })
    .filter((match) => match !== null)
    .sort((a, b) => b.score - a.score || getRecency(b.page) - getRecency(a.page))
    .map(({ page, snippet }) => toResult(page, snippet))
}

// Suggestions before typing: the most recent content, not the pages already in the header.
export async function getRecentPages(limit: number): Promise<SearchResult[]> {
  const navigation = new Set<string | null>(siteConfig.navigation.map(({ pageId }) => pageId))

  return (await getSitePages())
    .filter(({ id }) => !navigation.has(id))
    .sort((a, b) => getRecency(b) - getRecency(a))
    .slice(0, limit)
    .map((page) => toResult(page))
}
