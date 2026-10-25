import type { ReactNode } from 'react'
import { getNotionPage } from '@/lib/notion/get-page'

export default async function PageLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
  await getNotionPage(pageId)

  return children
}
