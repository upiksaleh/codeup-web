import { getEntryGallery } from '@/lib/notion/entry-gallery'
import { getEntryPages } from '@/lib/notion/index/entries'
import { EntryListing } from './entry-listing'

export async function EntryListingPage({ kind }: { kind: 'article' | 'project' }) {
  const [pages, gallery] = await Promise.all([getEntryPages(), getEntryGallery(kind)])
  const date = (page: (typeof pages)[number]) => page.project?.startDate ?? page.published
  const entries = pages
    .filter((page) => page.kind === kind)
    .sort((a, b) => date(b) - date(a) || a.title.localeCompare(b.title))
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
