'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { resolvePageId } from '@/lib/notion/page-url'
import { siteConfig } from '@/site.config'

export function SiteNavigation() {
  const pathname = usePathname()
  const currentPageId = resolvePageId(pathname.slice(1))

  return (
    <nav className="site-navigation" aria-label="Main navigation">
      {siteConfig.navigation.map(({ label, path, pageId }) => (
        <Link key={path} href={path} aria-current={pageId === currentPageId ? 'page' : undefined}>
          {label}
        </Link>
      ))}
      <Link href="/search" aria-current={pathname === '/search' ? 'page' : undefined}>
        Search
      </Link>
    </nav>
  )
}
