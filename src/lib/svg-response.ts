import { createHash } from 'node:crypto'

export function svgResponse(request: Request, image: Uint8Array) {
  const etag = `"${createHash('sha256').update(image).digest('hex')}"`
  const headers = {
    'Content-Type': 'image/svg+xml',
    'Content-Length': String(image.byteLength),
    'Content-Disposition': 'attachment; filename="image.svg"',
    'Content-Security-Policy': "default-src 'self'; script-src 'none'; sandbox;",
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
    ETag: etag,
  }
  return request.headers.get('if-none-match') === etag
    ? new Response(null, { status: 304, headers })
    : new Response(new Uint8Array(image), { headers })
}
