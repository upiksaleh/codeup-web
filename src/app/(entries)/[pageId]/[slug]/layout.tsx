import type { ReactNode } from 'react'
import { validatePagePath } from '@/lib/notion/get-page'

export default async function EntryLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ pageId: string; slug: string }>
}) {
  const { pageId: category, slug } = await params
  await validatePagePath(`${category}/${slug}`)
  return children
}
