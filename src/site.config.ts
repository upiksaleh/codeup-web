const rootNotionPageId = 'e664ac77-d51a-82f3-aa20-019a00acc091'
const notesPageId = '1264ac77-d51a-8351-aa55-816c46f31bc2'
const projectsDatabaseId = 'ecc33737-84d0-491e-a468-b7ce4abebea7'

export const siteConfig = {
  rootNotionPageId,
  notesPageId,
  projectsDatabaseId,
  articleCollectionId: 'd494ac77-d51a-8330-828c-07a4da417c6a',
  name: 'CodeUP',
  domain: 'codeup.id',
  description:
    "CodeUP is Upik's independent studio, building software from infrastructure and security to applications.",
  author: 'Upik',
  label: 'Independent Studio',
  logo: '/codeup.png',
  imageSources: [
    { hostname: 'app.notion.com', pathname: '/image/' },
    { hostname: 'app.notion.com', pathname: '/images/' },
    { hostname: 'app.notion.com', pathname: '/icons/' },
    { hostname: 'img.notionusercontent.com', pathname: '/s3/' },
  ],
  footerStatus: 'CodeUP is an independent studio run by Upik Saleh',
  navigation: [
    { label: 'Home', path: '/', pageId: rootNotionPageId },
    { label: 'Upik', path: '/upik', pageId: 'ce74ac77-d51a-8280-8913-81a8aec519bd' },
    { label: 'Notes', path: '/notes', pageId: notesPageId },
    { label: 'Projects', path: '/projects', pageId: projectsDatabaseId },
    { label: 'Contact', path: '/contact', pageId: '7ed4ac77-d51a-8385-af1c-011f2551fb4e' },
  ],
  socialLinks: [
    { label: 'GitHub', handle: 'upiksaleh', icon: 'github', url: 'https://github.com/upiksaleh' },
    {
      label: 'LinkedIn',
      handle: 'upik',
      icon: 'linkedin',
      url: 'https://www.linkedin.com/in/upik',
    },
    { label: 'X', handle: 'alrahmsa', icon: 'x', url: 'https://x.com/alrahmsa' },
  ],
} as const
