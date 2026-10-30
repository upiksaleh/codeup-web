'use client'

import Image, { type ImageProps } from 'next/image'
import { getBlockValue } from 'notion-utils'
import { createContext, useContext, useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import { canOptimizeImage } from '@/lib/notion/image-source'

// Page whose gallery card cover loads with high priority.
export const PriorityCoverContext = createContext<string | undefined>(undefined)

// The renderer attaches medium-zoom on load; this marks those images so the zoom also works by keyboard.
const zoomClass = 'medium-zoom-image'
const instantZoomImages = new WeakSet<HTMLImageElement>()

// Zoom opens with the on-screen variant instead of waiting for the full srcset.
function openWithLoadedImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  const { srcset, sizes, src, currentSrc } = image
  if (!srcset || !currentSrc) return

  image.removeAttribute('srcset')
  image.removeAttribute('sizes')
  image.src = currentSrc

  // medium-zoom clones the image synchronously after this event.
  queueMicrotask(() => {
    image.srcset = srcset
    image.sizes = sizes
    image.src = src

    const zoomed = document.querySelector<HTMLImageElement>('img.medium-zoom-image--opened')
    if (!zoomed || zoomed === image) return
    zoomed.removeAttribute('loading')
    zoomed.sizes = '100vw'
    zoomed.srcset = srcset
  })
}

export function NotionImage({ src, sizes, unoptimized, onError, onLoad, ...props }: ImageProps) {
  const { fullPage, recordMap, mapImageUrl } = useNotionContext()
  const priorityId = useContext(PriorityCoverContext)
  const priorityPage = priorityId ? getBlockValue(recordMap.block[priorityId]) : undefined
  const priorityCover = priorityPage?.format?.page_cover
  const isPriority = !!priorityCover && mapImageUrl(priorityCover, priorityPage) === src
  const [failedSource, setFailedSource] = useState<ImageProps['src']>()
  let imageSizes =
    sizes || '(max-width: 580px) calc(100vw - 44px), (max-width: 780px) calc(100vw - 60px), 720px'

  if (!fullPage && sizes?.includes('33vw')) {
    // Root galleries use three columns on desktop, two on tablet, and one on mobile.
    imageSizes = '(max-width: 540px) calc(100vw - 44px), (max-width: 860px) 50vw, 290px'
  } else if (props.className?.includes('notion-page-cover')) {
    imageSizes =
      '(max-width: 580px) calc(100vw - 24px), (max-width: 1248px) calc(100vw - 48px), 1200px'
  }

  return (
    <Image
      {...props}
      {...(isPriority && { preload: true, loading: undefined, fetchPriority: 'high' })}
      src={src}
      alt={props.alt}
      sizes={imageSizes}
      unoptimized={
        unoptimized || failedSource === src || (typeof src === 'string' && !canOptimizeImage(src))
      }
      onLoad={(event) => {
        onLoad?.(event)
        const image = event.currentTarget
        if (!image.classList.contains(zoomClass) || instantZoomImages.has(image)) return
        instantZoomImages.add(image)
        image.tabIndex = 0
        image.addEventListener('medium-zoom:open', openWithLoadedImage)
      }}
      onKeyDown={(event) => {
        const image = event.currentTarget
        if ((event.key === 'Enter' || event.key === ' ') && image.classList.contains(zoomClass)) {
          event.preventDefault()
          image.addEventListener('medium-zoom:closed', () => image.focus(), { once: true })
          image.click()
        }
      }}
      onError={(event) => {
        setFailedSource(src)
        onError?.(event)
      }}
    />
  )
}
