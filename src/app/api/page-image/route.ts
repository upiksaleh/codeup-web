import { renderPageSocialImage } from '@/lib/notion/page-social-image'

export async function GET(request: Request) {
  return renderPageSocialImage(new URL(request.url).searchParams.get('path') ?? '')
}
