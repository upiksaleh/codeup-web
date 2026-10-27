# CodeUP Web

CodeUP's website, built with Next.js, React, TypeScript, and public Notion content.

## Development

Requires Node.js 22.12+ and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000>.

## Configuration

Edit `src/site.config.ts` for site identity, navigation, and Notion sources.
Content and media are managed in Notion. Public pages require no token or
environment variables. Keep any secrets in server-only environment variables.

## Commands

```sh
pnpm check       # Format, lint, types, tests, and production build
pnpm fix:format  # Format files
pnpm fix:lint    # Fix lint issues
pnpm test       # Test cache behavior and image selection
pnpm build      # Build for production
pnpm start      # Serve the production build
```

Builds require network access to public Notion pages.

Validated Notion pages use the Next.js Data Cache plus a bounded process cache
(5 minutes, 128 pages). The site index is memoized for 5 minutes outside the
Data Cache to avoid nested cache bypasses. Image previews use a 24-hour cache
(up to 256 entries in memory) and four concurrent workers for rendered content.
Hard reloads reuse process-cached data; restart the dev server to clear that
memory cache. Cold requests and builds still require Notion and image downloads.
