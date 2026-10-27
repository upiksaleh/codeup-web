import { getEntryGallery } from '@/lib/notion/entry-gallery'
import { getSitePages } from '@/lib/notion/site-pages'
import { EntryListing } from './entry-listing'

export async function EntryListingPage({ kind }: { kind: 'article' | 'project' }) {
  const [pages, gallery] = await Promise.all([getSitePages(), getEntryGallery(kind)])
  const entries = pages
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

  return <EntryListing kind={kind} entries={entries} gallery={gallery} />
}
