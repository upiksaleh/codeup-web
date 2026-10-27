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
pnpm check       # Format, lint, types, and production build
pnpm fix:format  # Format files
pnpm fix:lint    # Fix lint issues
pnpm build      # Build for production
pnpm start      # Serve the production build
```

Builds require network access to public Notion pages.
