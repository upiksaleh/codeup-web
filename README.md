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
domain, description, author, logo, navigation, blog collection ID, allowed image sources,
and social links. The root page is public and needs
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
- `src/lib/notion/`: server-only page loading, route resolution, a public page index,
  metadata extraction, ID and ancestry checks, and page URLs.
- `src/styles/`: application styles, used alongside react-notion-x styles.
- `src/site.config.ts`: public site settings.
- `public/`: the CodeUP logo and remaining assets from the initial scaffold.

The `/` route combines the homepage hero with the Notion root page. `/upik`,
`/notes`, `/projects`, and `/contact` map to the verified public Notion pages in the navigation
configuration. `/<pageId>` also opens descendants using a 32-character hexadecimal
ID or UUID. Links and canonical metadata use the configured paths when available.
Unique Notion slugs (or title-derived slugs) and title-ID URLs also resolve to the
same pages. Slugs are compatibility aliases; canonical URLs remain configured
paths or stable page IDs. Ambiguous slugs return 404.
`/about` is reserved for the studio page and cannot resolve to the personal About title.
Unknown paths and pages outside the root return 404. Pages use ISR with a 300-second
revalidation interval; requests may receive cached content during regeneration.
The renderer uses the installed Collection component and native, keyboard-scrollable
code blocks. Syntax highlighting and copy controls are not included. Media and
page content remain managed by Notion. Pages must be public and belong to the
configured root.

`/search?q=...` searches titles, descriptions, tags, and page text on the server.
Queries are limited to 200 characters, and all search terms must match. No arbitrary
Notion search proxy or client-side record-map index is exposed. `/sitemap.xml`
lists the indexed pages once; `/robots.txt` points crawlers to it. `/feed` provides
RSS for the configured Blogs collection, excluding Projects. Metadata uses Notion
Description or Summary properties, covers, and article dates where available.

The shared index loads public descendants in batches of four and uses Next.js
`unstable_cache` with a 300-second revalidation interval. This API fits the existing
ISR setup without enabling Cache Components. Transient fetch failures propagate
instead of becoming a partial successful index. Cached search results, feed, and
sitemap can remain stale during regeneration; remove server caches when access
must be withdrawn immediately. No Redis or additional dependencies are required.

The layout supports small screens and light/dark themes. The default
follows the system; a manual selection is stored in browser local storage and
applied before paint. It does not require cookies, authentication, or new dependencies.

## Image loading

Notion covers, gallery images, and images with preview metadata use `next/image`
with responsive sizes and the default WebP optimizer. Covers load eagerly; gallery
and body images load lazily. The local logo is also optimized at the rendered size.
Server-generated 16-pixel WebP previews provide blur placeholders and intrinsic
dimensions without changing Notion content. `sharp` is a direct dependency for
this work; Next.js already uses the same installed version.

Image hosts and path prefixes are defined in `site.config.ts` and shared by the
optimizer and preview loader. Unlisted sources and SVGs render directly. If an
optimized image fails, the renderer retries its original URL. If a preview fails,
page content still renders. Preview loading checks each redirect and accepts only
supported raster responses, with an 8-second timeout, 10 MB download limit,
40-million-pixel decode limit, and batches of four. Successful previews use the
Next.js data cache for one day; full image variants use the Next.js image cache.
No Redis, image proxy service, or `lqip-modern` dependency is needed. Immediate
withdrawal of public media requires clearing these caches along with page caches.

Application UI, metadata, and repository documentation use English. Notion content
is rendered in its original language. The current pages are Indonesian, so the
main content region uses `lang="id"`.
