import type { Metadata } from 'next'
import { getSocialImageUrl } from '@/lib/social-image'
import { EntryListingPage } from '@/components/entry-listing-page'

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects',
    url: '/projects',
    type: 'website',
    images: [getSocialImageUrl()],
  },
  twitter: { title: 'Projects', images: [getSocialImageUrl()] },
}

export default function ProjectsPage() {
  return <EntryListingPage kind="project" />
}
