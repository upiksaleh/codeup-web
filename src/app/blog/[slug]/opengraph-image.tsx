/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from 'next/server';
export default async function BlogOG({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const { domain, slug } = params;
  console.log(params);

  //   const clashData = await fetch(
  //     new URL('@/styles/CalSans-SemiBold.otf', import.meta.url)
  //   ).then((res) => res.arrayBuffer());
  return new ImageResponse(
    (
      <div tw="flex flex-col items-center w-full h-full bg-white">
        <div tw="flex flex-col items-center justify-center mt-8">
          <h1 tw="text-6xl font-bold text-gray-900 leading-none tracking-tight">
            a;sa;sasa
          </h1>
          <div tw="flex items-center justify-center">
            {/* <img
              tw="w-12 h-12 rounded-full mr-4"
              src={data.authorImage}
              alt={data.authorName}
            /> */}
            <p tw="text-xl font-medium text-gray-900">by aksjalksja</p>
          </div>
          {/* <img
            tw="mt-4 w-5/6 rounded-2xl border border-gray-200 shadow-md"
            src={data.image}
            alt={data.title}
          /> */}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
      //   fonts: [
      //     {
      //       name: 'Clash',
      //       data: clashData,
      //     },
      //   ],
      emoji: 'blobmoji',
    }
  );
}
