'use client'

import type { CodeBlock } from 'notion-types'
import { getBlockTitle } from 'notion-utils'
import { useMemo } from 'react'
import { Text, useNotionContext } from 'react-notion-x'
import { highlightCode } from '@/lib/notion/highlight-code'
import { CopyButton } from './copy-button'

export function NotionCode({ block }: { block: CodeBlock }) {
  const { recordMap } = useNotionContext()
  const code = getBlockTitle(block, recordMap)
  const notionLanguage = block.properties.language?.[0]?.[0] || 'Plain Text'
  const { language, html } = useMemo(
    () => highlightCode(code, notionLanguage),
    [code, notionLanguage],
  )

  return (
    <figure className="notion-code-block">
      <div className="code-toolbar">
        <span>{notionLanguage}</span>
        <CopyButton value={code} label="Copy code" />
      </div>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allows keyboard scrolling of long code lines. */}
      <pre className={`notion-code language-${language}`} tabIndex={0} aria-label="Code block">
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      {block.properties.caption && (
        <figcaption className="notion-asset-caption">
          <Text value={block.properties.caption} block={block} />
        </figcaption>
      )}
    </figure>
  )
}
