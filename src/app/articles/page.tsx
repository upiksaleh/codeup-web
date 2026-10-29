import type { Metadata } from 'next'
import { getSocialImageUrl } from '@/lib/social-image'
import { EntryListingPage } from '@/components/entry-listing-page'

export const metadata: Metadata = {
  title: 'Articles',
  alternates: { canonical: '/articles', types: { 'application/rss+xml': '/feed' } },
  openGraph: {
    title: 'Articles',
    url: '/articles',
    type: 'website',
    images: [getSocialImageUrl()],
  },
  twitter: { title: 'Articles', images: [getSocialImageUrl()] },
}

export default function ArticlesPage() {
  return <EntryListingPage kind="article" />
}
