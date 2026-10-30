'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/site.config'
import { MobileMenu } from './mobile-menu'
import { SearchButton } from './search-button'
import { SiteNavigation } from './site-navigation'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/"
          prefetch={pathname === '/' ? false : undefined}
          className="site-name"
          aria-label={`${siteConfig.name} home`}
        >
          <Image src={siteConfig.logo} alt="" width={32} height={32} loading="eager" />
          <span>
            {siteConfig.name}
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <SiteNavigation />
        <div className="site-actions">
          <SearchButton />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
