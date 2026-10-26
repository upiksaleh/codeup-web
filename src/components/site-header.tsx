import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/site.config'
import { SearchButton } from './search-button'
import { SiteNavigation } from './site-navigation'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-name" aria-label={`${siteConfig.name} home`}>
          <Image src={siteConfig.logo} alt="" width={32} height={32} loading="eager" />
          <span>
            {siteConfig.name}
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <span className="site-label">{siteConfig.label}</span>
        <SiteNavigation />
        <div className="site-actions">
          <SearchButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
