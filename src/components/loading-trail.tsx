'use client'

import { useEffect } from 'react'
import { attachPointerTrail } from './pointer-trail'

// Loading fallbacks stay unhydrated on full loads, so the layout mounts the trail.
export function LoadingTrail() {
  useEffect(() => {
    const attached = new Map<HTMLCanvasElement, (() => void) | undefined>()

    function sync() {
      for (const canvas of document.querySelectorAll<HTMLCanvasElement>('.skeleton-cover canvas')) {
        if (!attached.has(canvas))
          attached.set(canvas, attachPointerTrail(canvas, { ambient: true }))
      }
      for (const [canvas, detach] of attached) {
        if (canvas.isConnected) continue
        detach?.()
        attached.delete(canvas)
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      for (const detach of attached.values()) detach?.()
    }
  }, [])

  return null
}
