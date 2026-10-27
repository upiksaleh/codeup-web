'use client'

import { useEffect, useRef } from 'react'

export function useGalleryCardTitles(enabled: boolean, maxLines = 2) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const collection = ref.current
    if (!enabled || !collection) return

    function updateTitles() {
      for (const card of collection!.querySelectorAll<HTMLElement>(
        '.notion-gallery-grid .notion-collection-card',
      )) {
        const title = card.querySelector<HTMLElement>(
          '.notion-collection-card-property:first-child .notion-page-title-text',
        )
        if (!title || !title.getClientRects().length) continue

        // Measure the natural title without changing its final visual state.
        const { height, webkitLineClamp, transition } = title.style
        title.style.transition = 'none'
        title.style.height = 'auto'
        title.style.webkitLineClamp = 'unset'
        const style = getComputedStyle(title)
        const textHeight = title.getBoundingClientRect().height - parseFloat(style.paddingTop)
        const collapsedHeight = Math.min(textHeight, parseFloat(style.lineHeight) * maxLines)
        title.style.height = height
        title.style.webkitLineClamp = webkitLineClamp

        card.style.setProperty('--gallery-title-height', `${collapsedHeight}px`)
        card.toggleAttribute('data-title-overflow', textHeight > collapsedHeight + 1)
        // Commit the restored size before re-enabling hover transitions.
        title.getBoundingClientRect()
        title.style.transition = transition
      }
    }

    const resizeObserver = new ResizeObserver(updateTitles)
    const mutationObserver = new MutationObserver(updateTitles)
    resizeObserver.observe(collection)
    mutationObserver.observe(collection, { childList: true, subtree: true, characterData: true })
    updateTitles()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [enabled, maxLines])

  return ref
}
