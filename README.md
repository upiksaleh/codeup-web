# CodeUP Web

A standalone Next.js App Router application for public Notion content.

## Setup

Requires Node.js >=22.12 and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000>. To run a production build locally:

```sh
pnpm build
pnpm start
```

## Configuration

Public settings live in `src/site.config.ts`: the Notion root page ID, site name,
domain, description, author, and social links. The root page is public and needs
no environment variables or tokens. `.env.example` contains no values.
Other `.env*` files are ignored. Keep secrets in server environment variables
without the `NEXT_PUBLIC_` prefix.

## Scripts

| Command             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Start the development server                                   |
| `pnpm fix:format`   | Format with oxfmt, without semicolons                          |
| `pnpm check:format` | Check formatting                                               |
| `pnpm fix:lint`     | Apply oxlint fixes                                             |
| `pnpm check:lint`   | Check lint rules                                               |
| `pnpm typecheck`    | Run `tsc --noEmit` in strict mode                              |
| `pnpm build`        | Build for production; requires access to public Notion pages   |
| `pnpm start`        | Serve the production build                                     |
| `pnpm check`        | Run formatting, lint, type checking, and build checks in order |

## Structure

- `src/app/`: routes, layouts, metadata, loading, error, and 404 states.
- `src/components/`: server components and the client Notion renderer.
- `src/lib/notion/`: server-only data access, ID and ancestry checks, and page URLs.
- `src/styles/`: application styles, used alongside react-notion-x styles.
- `src/site.config.ts`: public site settings.
- `public/`: static assets, including unused assets from the initial scaffold.

The `/` route displays the Notion root page. `/<pageId>` opens its descendants
using a 32-character hexadecimal ID or UUID. Pages use ISR with a 300-second
revalidation interval; requests may receive cached content during regeneration.
Collection is the only optional renderer component enabled because the root page
uses it. Media uses the default renderer. Pages must be public and belong to the
configured root.

Application UI, metadata, and repository documentation use English. Notion content
is rendered in its original language. The current pages are Indonesian, so the
main content region uses `lang="id"`.
