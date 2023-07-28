import MainHeader from '@/components/header/main-header';
import { Mdx } from '@/components/mdx/mdx';
import { allBlogs } from 'contentlayer/generated';
import Link from 'next/link';
export default function BlogIndexPage() {
  return (
    <>
      <MainHeader
        title="Abdul Rahman Saleh [upik]"
        description="Fullstack Web Developer"
      />
      <main className="base-main">
        {allBlogs.map((b, i) => (
          <div key={i}>
            <Link href={`/blog/${b.slug}`}>{b.title}</Link>
          </div>
        ))}
      </main>
    </>
  );
}
