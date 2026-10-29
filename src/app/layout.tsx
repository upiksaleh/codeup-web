import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LoadingTrail } from '@/components/loading-trail'
import { getSocialImageUrl } from '@/lib/social-image'
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
    images: [getSocialImageUrl()],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [getSocialImageUrl()],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#21252b' },
  ],
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
        <SiteHeader />
        <div id="main-content" className="site-content" lang="id" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
        <LoadingTrail />
      </body>
    </html>
  )
}
