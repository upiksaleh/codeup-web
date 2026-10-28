'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { useSiteTheme } from '@/lib/theme'

// Mermaid has shared configuration; keep initialization and rendering together.
let renderQueue = Promise.resolve()

export function MermaidDiagram({
  enabled,
  code,
  children,
}: {
  enabled: boolean
  code: string
  children: ReactNode
}) {
  const theme = useSiteTheme()
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [result, setResult] = useState<{
    code: string
    theme: string
    svg?: string
  }>()

  useEffect(() => {
    if (!enabled || !theme) return
    let cancelled = false

    renderQueue = renderQueue.then(async () => {
      if (cancelled) return
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.visibility = 'hidden'
      container.setAttribute('aria-hidden', 'true')
      document.body.append(container)
      try {
        const mermaid = (await import('mermaid')).default
        if (cancelled) return
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
          flowchart: { htmlLabels: false },
          suppressErrorRendering: true,
        })
        const { svg } = await mermaid.render(id, code, container)
        if (!cancelled) setResult({ code, theme, svg })
      } catch {
        if (!cancelled) setResult({ code, theme })
      } finally {
        container.remove()
      }
    })

    return () => {
      cancelled = true
    }
  }, [enabled, code, theme, id])

  const current = result?.code === code && result.theme === theme ? result : undefined
  if (!enabled) return children
  return current?.svg ? (
    <div
      className="notion-mermaid"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The diagram contains inline SVG rather than an image URL.
      role="img"
      aria-label="Mermaid diagram"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allows keyboard scrolling of wide diagrams.
      tabIndex={0}
      dangerouslySetInnerHTML={{ __html: current.svg }}
    />
  ) : (
    <>
      {current && <output>Unable to render this diagram. The source is shown below.</output>}
      {children}
    </>
  )
}
