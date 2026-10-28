'use client'

import type { CodeBlock } from 'notion-types'
import { getBlockTitle } from 'notion-utils'
import { useMemo } from 'react'
import { Text, useNotionContext } from 'react-notion-x'
import { highlightCode } from '@/lib/notion/highlight-code'
import { CopyButton } from './copy-button'
import { MermaidDiagram } from './mermaid-diagram'

export function NotionCode({ block }: { block: CodeBlock }) {
  const { recordMap } = useNotionContext()
  const code = getBlockTitle(block, recordMap)
  const notionLanguage = block.properties.language?.[0]?.[0] || 'Plain Text'
  const isMermaid = notionLanguage.trim().toLowerCase() === 'mermaid'
  const { language, html } = useMemo(
    () => highlightCode(code, notionLanguage),
    [code, notionLanguage],
  )

  return (
    <figure className="notion-code-block">
      <div className="notion-code-container">
        <CopyButton value={code} label="Copy code" />
        <MermaidDiagram enabled={isMermaid} code={code}>
          <pre
            className={`notion-code language-${language}`}
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allows keyboard scrolling of long code lines.
            tabIndex={0}
            aria-label={`${notionLanguage} code block`}
          >
            <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </MermaidDiagram>
      </div>
      {block.properties.caption && (
        <figcaption className="notion-asset-caption">
          <Text value={block.properties.caption} block={block} />
        </figcaption>
      )}
    </figure>
  )
}
