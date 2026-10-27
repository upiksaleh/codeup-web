import { getEntryGallery } from '@/lib/notion/entry-gallery'
import { getSitePages } from '@/lib/notion/site-pages'
import { EntryListing } from './entry-listing'

export async function EntryListingPage({ kind }: { kind: 'article' | 'project' }) {
  const entries = (await getSitePages())
    .filter((page) => page.kind === kind)
    .sort((a, b) => b.published - a.published || a.title.localeCompare(b.title))
    .map(({ id, url, title, description, tags, project }) => ({
      id,
      url,
      title,
      description,
      tags,
      techStack: project?.techStack ?? [],
    }))

  return <EntryListing kind={kind} entries={entries} gallery={await getEntryGallery(kind)} />
}
