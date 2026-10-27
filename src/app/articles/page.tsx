import type { Metadata } from 'next'
import { EntryListingPage } from '@/components/entry-listing-page'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Articles',
  alternates: { canonical: '/articles', types: { 'application/rss+xml': '/feed' } },
  openGraph: { title: 'Articles', url: '/articles', type: 'website' },
  twitter: { title: 'Articles' },
}

export default function ArticlesPage() {
  return <EntryListingPage kind="article" />
}
