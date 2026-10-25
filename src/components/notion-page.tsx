import { getNotionPage } from '@/lib/notion/get-page'
import { NotionContent } from './notion-content'

export async function NotionPage({ pageId }: { pageId: string }) {
  const recordMap = await getNotionPage(pageId)

  return <NotionContent recordMap={recordMap} />
}
