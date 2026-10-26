import { getSearchTerms, getTermPattern } from '@/lib/search-terms'

// Marks the query terms inside text with the same word-start rule as search.
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = getSearchTerms(query)
  if (!terms.length) return text

  return text
    .split(getTermPattern(terms, 'giu'))
    .map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part))
}
