'use client';

import Logo from '../logo';
import useWindowSize from '@/hooks/use-window-size';
import MenuIcon from '../icons/menu';
import Link from 'next/link';

type MainHeaderProps = {
  title?: string;
  description?: string;
};
export default function MainHeader({
  title = 'codeup',
  description = '',
}: MainHeaderProps) {
  const { isMobile } = useWindowSize();
  return (
    <header className="">
      <div className="base-container">
        {isMobile ? (
          <div className="flex justify-end p-5">
            <div>
              <MenuIcon className="text-white w-8 h-8" />
            </div>
          </div>
        ) : (
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/upik">Profil</Link>
              </li>
              <li>
                <Link href="/ada">Ada</Link>
              </li>
            </ul>
          </nav>
        )}
        <div className="flex items-end gap-8 pt-[20px]">
          <div className="bg-white rounded-t-lg">
            <Logo className="w-[150px] h-[150px] text-primary -mb-10" />
          </div>
          <div className="flex flex-col gap-2 w-full text-white">
            <h1 className="text-xl md:text-2xl lg:text-5xl">{title}</h1>
            <div className="font-mono mb-2">{description}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
