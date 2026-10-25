import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SiteNavigation } from '@/components/site-navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/site.config'
import 'react-notion-x/styles.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  icons: { icon: siteConfig.logo, apple: siteConfig.logo },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
          const theme = localStorage.getItem('codeup-theme')
          if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
        } catch {}`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-name" aria-label={`${siteConfig.name} home`}>
              <Image src={siteConfig.logo} alt="" width={32} height={32} unoptimized />
              <span>
                {siteConfig.name}
                <span className="brand-dot">.</span>
              </span>
            </Link>
            <span className="site-label">{siteConfig.label}</span>
            <SiteNavigation />
            <ThemeToggle />
          </div>
        </header>
        <div id="main-content" className="site-content" lang="id" tabIndex={-1}>
          {children}
        </div>
        <footer className="site-footer">
          <div>
            <Link href="/" className="footer-name">
              {siteConfig.name}
              <span className="brand-dot">.</span>
            </Link>
            <p>{siteConfig.footerStatus}</p>
          </div>
          <nav aria-label="Social media">
            {Object.entries(siteConfig.socialLinks).map(([label, url]) => (
              <a key={label} href={url}>
                {label}
              </a>
            ))}
          </nav>
        </footer>
      </body>
    </html>
  )
}
