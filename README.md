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
domain, description, author, logo, navigation, and social links. The root page is public and needs
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
- `public/`: the CodeUP logo and remaining assets from the initial scaffold.

The `/` route combines the homepage hero with the Notion root page. `/upik`,
`/notes`, and `/contact` map to the verified public Notion pages in the navigation
configuration. `/<pageId>` also opens descendants using a 32-character hexadecimal
ID or UUID. Links and canonical metadata use the configured paths when available.
Unknown paths and pages outside the root return 404. Pages use ISR with a 300-second
revalidation interval; requests may receive cached content during regeneration.
The renderer uses the installed Collection component and native, keyboard-scrollable
code blocks. Syntax highlighting and copy controls are not included. Media and
page content remain managed by Notion. Pages must be public and belong to the
configured root.

The layout supports small screens and light/dark themes. The default
follows the system; a manual selection is stored in browser local storage and
applied before paint. It does not require cookies, authentication, or new dependencies.

Application UI, metadata, and repository documentation use English. Notion content
is rendered in its original language. The current pages are Indonesian, so the
main content region uses `lang="id"`.
