'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/site.config'

export function SiteNavigation({
  className = 'site-navigation',
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const section = pathname.startsWith('/project/')
    ? '/projects'
    : pathname.startsWith('/article/')
      ? '/articles'
      : pathname

  return (
    <nav className={className} aria-label="Main navigation">
      {siteConfig.navigation.map(({ label, path }) => (
        <Link
          key={path}
          href={path}
          prefetch={path === pathname ? false : undefined}
          className={path === siteConfig.navigationCta ? 'navigation-cta' : undefined}
          aria-current={path === pathname ? 'page' : path === section ? 'location' : undefined}
          onClick={onNavigate}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
