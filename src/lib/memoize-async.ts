// Keep resolved values bounded and share pending work without retaining failures.
export function memoizeAsync<K, V>(
  load: (key: K) => Promise<V>,
  { ttl, maxEntries }: { ttl: number; maxEntries: number },
) {
  const values = new Map<K, { value: V; expiresAt: number }>()
  const pending = new Map<K, Promise<V>>()

  return (key: K): Promise<V> => {
    const entry = values.get(key)
    if (entry && entry.expiresAt > Date.now()) return Promise.resolve(entry.value)
    values.delete(key)

    const existing = pending.get(key)
    if (existing) return existing

    const promise = Promise.resolve()
      .then(() => load(key))
      .then((value) => {
        for (const [cachedKey, cached] of values) {
          if (cached.expiresAt <= Date.now()) values.delete(cachedKey)
        }
        if (values.size >= maxEntries) values.delete(values.keys().next().value!)
        values.set(key, { value, expiresAt: Date.now() + ttl })
        return value
      })
      .finally(() => pending.delete(key))

    pending.set(key, promise)
    return promise
  }
}
