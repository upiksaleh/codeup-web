'use client'

import { useEffect } from 'react'

// Position along an inline link, across wrapped lines, as a percentage of its full length.
// Uses the line nearest to the pointer, since leave events can fire just outside the text.
function getLinkOrigin(link: HTMLElement, x: number, y: number) {
  const rects = [...link.getClientRects()]
  const total = rects.reduce((sum, rect) => sum + rect.width, 0)
  if (!total) return 50
  let offset = 0
  let best = { distance: Infinity, position: total / 2 }

  for (const rect of rects) {
    const distance = Math.max(rect.top - y, y - rect.bottom, 0)
    if (distance < best.distance) {
      best = { distance, position: offset + Math.min(Math.max(x - rect.left, 0), rect.width) }
    }
    offset += rect.width
  }
  return (best.position / total) * 100
}

// Link underlines grow from where the pointer enters and shrink toward where it leaves.
export function usePointerEffects() {
  useEffect(() => {
    function onLinkCross(event: PointerEvent) {
      const link = (event.target as Element).closest?.<HTMLElement>('.notion-link')
      if (!link || link.contains(event.relatedTarget as Node | null)) return
      const origin = getLinkOrigin(link, event.clientX, event.clientY)
      link.style.setProperty('--link-origin', `${origin}%`)
    }

    document.addEventListener('pointerover', onLinkCross)
    document.addEventListener('pointerout', onLinkCross)
    return () => {
      document.removeEventListener('pointerover', onLinkCross)
      document.removeEventListener('pointerout', onLinkCross)
    }
  }, [])
}
