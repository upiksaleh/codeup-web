import { notFound } from 'next/navigation';
import { Mdx } from '@/components/mdx/mdx';
import { allBlogs } from 'contentlayer/generated';
import MainHeader from '@/components/header/main-header';
import Script from 'next/script';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { domain: string; slug: string };
}): Promise<Metadata | undefined> {
  const post = allBlogs.find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  const { title, summary: description, publishedAt, slug } = post;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      publishedTime: publishedAt,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_URL}/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@alrahmsa',
    },
  };
}

export default async function BlogSlugPage({ params: { slug } }) {
  const post = allBlogs.find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <MainHeader
        title={post.title}
        description={formatDate(post.publishedAt)}
      />
      <main className="base-main">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[60%,auto] xl:gap-[72px]">
          <div className="lg:order-last">
            {post.headings && post.headings.length && (
              <div className="w-full rounded-lg p-3 bg-gray-100 drop-shadow-md sticky top-0">
                <h1 className="text-xl mb-3">Daftar isi</h1>
                <div className="toc text-sm">
                  {post.headings.map((heading) => {
                    return (
                      <div key={`#${heading.slug}`}>
                        <a
                          data-level={heading.level}
                          href={`#${heading.slug}`}
                          className="line-clamp-1 hover:underline"
                          title={heading.text}
                        >
                          {heading.text}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Mdx code={post.body.code} />
        </div>
      </main>
    </>
  );
}
