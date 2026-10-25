import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { siteConfig } from '@/site.config'
import 'react-notion-x/styles.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
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
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="site-name">
            {siteConfig.name}
          </Link>
          <span>{siteConfig.label}</span>
        </header>
        <main id="main-content" lang="id">
          {children}
        </main>
        <footer className="site-footer">
          <span>{siteConfig.label}</span>
          <p>{siteConfig.footerStatus}</p>
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
