const rootNotionPageId = 'e664ac77-d51a-82f3-aa20-019a00acc091'

export const siteConfig = {
  rootNotionPageId,
  name: 'CodeUP',
  domain: 'codeup.id',
  description:
    "CodeUP is Upik's independent studio, building software from infrastructure and security to applications.",
  author: 'Upik',
  label: 'Independent Studio',
  logo: '/codeup.png',
  footerStatus: 'CodeUP is an independent studio run by Upik Saleh',
  navigation: [
    { label: 'Home', path: '/', pageId: rootNotionPageId },
    { label: 'Upik', path: '/upik', pageId: 'ce74ac77-d51a-8280-8913-81a8aec519bd' },
    { label: 'Notes', path: '/notes', pageId: '1264ac77-d51a-8351-aa55-816c46f31bc2' },
    { label: 'Contact', path: '/contact', pageId: '7ed4ac77-d51a-8385-af1c-011f2551fb4e' },
  ],
  socialLinks: {
    GitHub: 'https://github.com/upiksaleh',
    LinkedIn: 'https://www.linkedin.com/in/upik',
    X: 'https://x.com/alrahmsa',
  },
} as const
