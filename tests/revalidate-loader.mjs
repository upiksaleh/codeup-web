// Swaps Next's cache, the Notion client, and the site index for in-memory fakes.
const fakes = {
  'next/cache': './fakes/next-cache.mjs',
  '../client': './fakes/notion-client.mjs',
  './client': './fakes/notion-client.mjs',
  './site': './fakes/site-index.mjs',
  '@/lib/notion/index/site': './fakes/site-index.mjs',
}

export function resolve(specifier, context, nextResolve) {
  const fake = fakes[specifier]
  const fromApp = specifier === 'next/cache' || context.parentURL?.includes('/src/lib/notion/')
  if (fake && (fromApp || specifier.startsWith('@/'))) {
    return { url: new URL(fake, import.meta.url).href, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
