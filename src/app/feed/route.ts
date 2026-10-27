import { getSitePages } from '@/lib/notion/site-pages'
import { siteConfig } from '@/site.config'

export const dynamic = 'force-static'
export const revalidate = 300

function xml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]!
  })
}

export async function GET() {
  const origin = `https://${siteConfig.domain}`
  const articles = (await getSitePages())
    .filter(({ isArticle }) => isArticle)
    .sort((a, b) => b.published - a.published)
  const items = articles
    .map(({ title, url, description, published }) => {
      const link = xml(`${origin}${url}`)
      return `<item><title>${xml(title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><description>${xml(description)}</description><pubDate>${new Date(published).toUTCString()}</pubDate></item>`
    })
    .join('')

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(siteConfig.name)}</title><link>${origin}/</link><description>${xml(siteConfig.description)}</description>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  )
}
