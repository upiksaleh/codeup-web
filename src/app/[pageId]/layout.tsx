import { permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getNotionPage } from '@/lib/notion/get-page'
import { getSitePageUrl } from '@/lib/notion/site-pages'

export default async function PageLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ pageId: string }>
}) {
  const { pageId: segment } = await params
  const { pageId } = await getNotionPage(segment)
  const url = await getSitePageUrl(pageId)

  const requested = new Set([`/${segment}`])
  try {
    requested.add(`/${decodeURIComponent(segment)}`)
  } catch {}

  // ID, title-ID, and alias URLs keep working but move to the canonical path.
  if (!requested.has(url)) permanentRedirect(url)

  return children
}
