import type { Metadata } from 'next'
import { EntryListingPage } from '@/components/entry-listing-page'

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
  openGraph: { title: 'Projects', url: '/projects', type: 'website' },
  twitter: { title: 'Projects' },
}

export default function ProjectsPage() {
  return <EntryListingPage kind="project" />
}
