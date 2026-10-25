'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import { canOptimizeImage } from '@/lib/notion/image-source'

export function NotionImage({ src, sizes, unoptimized, onError, ...props }: ImageProps) {
  const { fullPage } = useNotionContext()
  const [failedSource, setFailedSource] = useState<ImageProps['src']>()
  let imageSizes =
    sizes || '(max-width: 580px) calc(100vw - 44px), (max-width: 780px) calc(100vw - 60px), 720px'

  if (!fullPage && sizes?.includes('33vw')) {
    imageSizes = '(max-width: 580px) calc(100vw - 44px), (max-width: 1200px) 50vw, 560px'
  } else if (props.className?.includes('notion-page-cover')) {
    imageSizes =
      '(max-width: 580px) calc(100vw - 24px), (max-width: 1200px) calc(100vw - 48px), 1152px'
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
      onError={(event) => {
        setFailedSource(src)
        onError?.(event)
      }}
    />
  )
}
