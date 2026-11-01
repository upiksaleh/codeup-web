'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/site.config'
import { LogoSymbol, LogoWordmark } from './logo'
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
          <LogoSymbol width={32} />
          <LogoWordmark width={128} />
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
