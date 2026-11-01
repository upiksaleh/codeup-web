import { AsyncLocalStorage } from 'node:async_hooks'

// Mirrors the unstable_cache behavior the page cache relies on: entries keyed by the
// callback source and key parts, JSON round trips, tag invalidation, and nested calls
// skipping the lookup but still writing their result.
const entries = new Map()
const nesting = new AsyncLocalStorage()
export const revalidated = { tags: [], paths: [] }

export function unstable_cache(cb, keyParts, { tags = [] } = {}) {
  const key = `${cb.toString()}-${keyParts.join(',')}`
  return async (...args) => {
    const invocationKey = `${key}-${JSON.stringify(args)}`
    const cached = entries.get(invocationKey)
    if (cached && !nesting.getStore()) return JSON.parse(cached.body)
    const result = await nesting.run(true, () => cb(...args))
    entries.set(invocationKey, { body: JSON.stringify(result), tags })
    return result
  }
}

export function revalidateTag(tag) {
  revalidated.tags.push(tag)
  for (const [key, entry] of entries) if (entry.tags.includes(tag)) entries.delete(key)
}

export function revalidatePath(path, type) {
  revalidated.paths.push(`${path}:${type}`)
}

export function resetCache() {
  entries.clear()
  revalidated.tags.length = 0
  revalidated.paths.length = 0
}
