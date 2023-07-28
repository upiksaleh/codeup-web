import MainHeader from '@/components/header/main-header';
import { Mdx } from '@/components/mdx/mdx';
import { formatDate } from '@/lib/utils';
import { allBlogs } from 'contentlayer/generated';
import Link from 'next/link';
export default function BlogIndexPage() {
  return (
    <>
      <MainHeader title="Blog" />
      <main className="base-main">
        <div className="flex flex-col gap-2">
          {allBlogs
            .sort((a, b) => {
              if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
                return -1;
              }
              return 1;
            })
            .map((b, i) => (
              <Link
                key={i}
                href={`/blog/${b.slug}`}
                className="bg-white rounded-md drop-shadow-sm p-3 w-full"
              >
                <h2 className="font-semibold">{b.title}</h2>
                <div>{formatDate(b.publishedAt, false)}</div>
              </Link>
            ))}
        </div>
      </main>
    </>
  );
}
