// Search terms match at the start of a word, so "api" finds "APIs" but not "tetapi".
export function getSearchTerms(query: string) {
  return query.toLocaleLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)
}

function escape(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getTermPattern(terms: string[], flags = 'iu') {
  return new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(escape).join('|')})`, flags)
}
