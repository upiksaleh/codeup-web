// Resolve the application's TypeScript paths for the native Node test runner.
export function resolve(specifier, context, nextResolve) {
  // Native Node tests execute server helpers without Next.js' server compiler condition.
  if (specifier === 'server-only') {
    return { url: 'data:text/javascript,export {}', shortCircuit: true }
  }
  if (specifier.startsWith('@/')) {
    return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context)
  }
  if (
    specifier.startsWith('.') &&
    context.parentURL?.includes('/src/') &&
    !specifier.endsWith('.ts')
  ) {
    return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context)
  }
  return nextResolve(specifier, context)
}
