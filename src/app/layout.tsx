import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LoadingTrail } from '@/components/loading-trail'
import { SiteUrlContext } from '@/components/site-url-context'
import { getSocialImageUrl } from '@/lib/social-image'
import { siteUrl } from '@/lib/site-url'
import { siteConfig } from '@/site.config'
import 'react-notion-x/styles.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
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
        <Script
          id="site-theme"
          strategy="beforeInteractive"
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
          <SiteUrlContext value={siteUrl}>{children}</SiteUrlContext>
        </div>
        <SiteFooter />
        <LoadingTrail />
      </body>
    </html>
  )
}
