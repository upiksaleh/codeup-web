'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ExtendedRecordMap } from 'notion-types'
import { useEffect, useMemo, type ComponentProps, type ReactNode } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { useSiteTheme } from '@/lib/theme'
import { normalizePageId } from '@/lib/notion/page-id'
import { withCollectionPropertyOrder } from '@/lib/notion/collection-property-order'
import { getPageUrl } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'
import { NotionImage } from './notion-image'
import { MobileTableOfContents } from './mobile-table-of-contents'
import { TableOfContents, useTableOfContents } from './table-of-contents'
import { NotionCollection, type NotionCollectionProps } from './notion-collection'
import { attachPointerTrail } from './pointer-trail'
import { propertyDateValue } from './property-date-value'
import { usePointerEffects } from './use-pointer-effects'
import { LinkPreviews } from './link-previews'

const NotionCode = dynamic(() => import('./notion-code').then((module) => module.NotionCode))

// The renderer sets target="_blank" on every link; internal pages should open in place.
function NotionLink({ href, target, rel, children, ...props }: ComponentProps<'a'>) {
  if (href?.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target={target ?? '_blank'} rel={rel ?? 'noopener noreferrer'} {...props}>
      {children}
    </a>
  )
}

export function NotionContent({
  recordMap,
  pageId,
  pageUrls,
  previewTargets,
  isHome,
  isEntrySubpage,
  pageType,
  pageHeader,
  pageCover,
  pageProperties,
  pageFooter,
}: {
  recordMap: ExtendedRecordMap
  pageId: string
  pageUrls: Record<string, string>
  previewTargets: Record<string, string>
  isHome: boolean
  isEntrySubpage: boolean
  pageType?: 'article' | 'project'
  pageHeader: ReactNode
  pageCover?: ReactNode
  pageProperties?: ReactNode
  pageFooter?: ReactNode
}) {
  const theme = useSiteTheme()
  const renderMap = useMemo(() => withCollectionPropertyOrder(recordMap), [recordMap])
  const toc = useTableOfContents(recordMap, pageId, !isHome)
  usePointerEffects()
  // The renderer shows a database page's properties through Collection; a page with its own
  // property view replaces that generic table.
  const PageCollection = useMemo(
    () =>
      function PageCollection(props: NotionCollectionProps) {
        return pageProperties && props.block.id === pageId ? (
          pageProperties
        ) : (
          <NotionCollection {...props} />
        )
      },
    [pageId, pageProperties],
  )
  useEffect(() => {
    // The renderer owns the cover markup, so the trail canvas is added after it renders.
    const cover = document.querySelector('.content-page .notion-page-cover-wrapper')
    if (!cover) return
    const canvas = document.createElement('canvas')
    canvas.className = 'pointer-trail'
    canvas.setAttribute('aria-hidden', 'true')
    cover.append(canvas)
    const detach = attachPointerTrail(canvas)
    return () => {
      detach?.()
      canvas.remove()
    }
  }, [pageId])
  return (
    <>
      <NotionRenderer
        recordMap={renderMap}
        blockId={pageId}
        rootPageId={siteConfig.rootNotionPageId}
        rootDomain={siteConfig.domain}
        mapPageUrl={(id) => pageUrls[normalizePageId(id) ?? ''] ?? getPageUrl(id)}
        fullPage={!isHome}
        showCollectionViewDropdown={!isHome}
        className={
          isHome
            ? 'home-page'
            : `content-page${pageType ? ` ${pageType}-page` : ''}${isEntrySubpage ? ' entry-subpage' : ''}`
        }
        pageHeader={pageHeader}
        pageCover={pageCover}
        pageFooter={pageFooter}
        showTableOfContents={false}
        pageAside={toc.entries.length ? <TableOfContents toc={toc} /> : undefined}
        disableHeader
        darkMode={theme === 'dark'}
        previewImages
        components={{
          Link: NotionLink,
          nextImage: NotionImage,
          Collection: PageCollection,
          Code: NotionCode,
          propertyDateValue,
        }}
      />
      <LinkPreviews key={`previews-${pageId}`} pageId={pageId} targets={previewTargets} />
      {!!toc.entries.length && <MobileTableOfContents key={pageId} toc={toc} />}
    </>
  )
}
