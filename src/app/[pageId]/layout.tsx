import type { ReactNode } from 'react'
import { validatePagePath } from '@/lib/notion/get-page'

export default async function PageLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ pageId: string }>
}) {
  const { pageId: segment } = await params
  await validatePagePath(segment)

  return children
}
