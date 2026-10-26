'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import { canOptimizeImage } from '@/lib/notion/image-source'

// The renderer attaches medium-zoom on load; this marks those images so the zoom also works by keyboard.
const zoomClass = 'medium-zoom-image'

export function NotionImage({ src, sizes, unoptimized, onError, onLoad, ...props }: ImageProps) {
  const { fullPage } = useNotionContext()
  const [failedSource, setFailedSource] = useState<ImageProps['src']>()
  let imageSizes =
    sizes || '(max-width: 580px) calc(100vw - 44px), (max-width: 780px) calc(100vw - 60px), 720px'

  if (!fullPage && sizes?.includes('33vw')) {
    imageSizes = '(max-width: 580px) calc(100vw - 44px), (max-width: 1200px) 50vw, 560px'
  } else if (props.className?.includes('notion-page-cover')) {
    imageSizes =
      '(max-width: 580px) calc(100vw - 24px), (max-width: 1248px) calc(100vw - 48px), 1200px'
  }

  return (
    <Image
      {...props}
      src={src}
      alt={props.alt}
      sizes={imageSizes}
      unoptimized={
        unoptimized || failedSource === src || (typeof src === 'string' && !canOptimizeImage(src))
      }
      onLoad={(event) => {
        onLoad?.(event)
        const image = event.currentTarget
        if (image.classList.contains(zoomClass)) image.tabIndex = 0
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
