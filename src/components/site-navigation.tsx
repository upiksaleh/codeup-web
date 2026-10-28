'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/site.config'

export function SiteNavigation() {
  const pathname = usePathname()

  return (
    <nav className="site-navigation" aria-label="Main navigation">
      {siteConfig.navigation.map(({ label, path }) => (
        <Link
          key={path}
          href={path}
          className={path === siteConfig.navigationCta ? 'navigation-cta' : undefined}
          aria-current={path === pathname ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
