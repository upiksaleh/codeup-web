import Link from 'next/link'
import { siteConfig } from '@/site.config'
import { Icon } from './ui/icon'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-name">
          {siteConfig.name}
          <span className="brand-dot">.</span>
        </Link>
        <p>{siteConfig.footerStatus}</p>
      </div>
      <nav aria-label="Social media and feeds" className="footer-links">
        {siteConfig.socialLinks.map(({ label, handle, icon, url }) => (
          <a
            key={label}
            href={url}
            rel="me noopener"
            className="icon-button"
            aria-label={`${label} (@${handle})`}
            title={`${label} @${handle}`}
          >
            <Icon name={icon} width={18} height={18} />
          </a>
        ))}
        <a href="/feed" className="icon-button" aria-label="RSS feed" title="RSS feed">
          <Icon name="rss" width={18} height={18} />
        </a>
      </nav>
    </footer>
  )
}
