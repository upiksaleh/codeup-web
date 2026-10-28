'use client'

import { getBlockValue } from 'notion-utils'
import { PageIcon, useNotionContext } from 'react-notion-x'

// Project pages show the Notion icon beside their details instead of over the cover.
export function ProjectIcon({ pageId }: { pageId: string }) {
  const { recordMap } = useNotionContext()
  const block = getBlockValue(recordMap.block[pageId])
  if (!block?.format?.page_icon) return null

  return (
    <div className="project-icon">
      <PageIcon block={block} inline={false} hideDefaultIcon />
    </div>
  )
}
