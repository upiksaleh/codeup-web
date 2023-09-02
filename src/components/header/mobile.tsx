'use client';

import { useState } from 'react';
import MenuIcon from '../icons/menu';
import clsx from 'clsx';
import CloseIcon from '../icons/close';
import { MenusType } from './main-header';
import Link from 'next/link';

export default function HeaderMobile({ menus }: { menus: MenusType }) {
  const [menuShow, setMenuShow] = useState(false);
  return (
    <div className="flex justify-end p-5">
      <button className="p-2" onClick={() => setMenuShow(true)}>
        <MenuIcon className="text-white w-8 h-8" />
      </button>

      <div
        className={clsx(
          'fixed w-screen h-screen bg-primary left-0 top-0 z-10 transition-transform',
          menuShow ? 'transform-none' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col">
          <div className="flex justify-end p-5">
            <button onClick={() => setMenuShow(false)}>
              <CloseIcon className="text-white w-8 h-8" />
            </button>
          </div>
          <div className="h-full px-3 py-4">
            <ul className="space-y-2 font-medium">
              {menus.map((menu, i) => (
                <li key={i} onClick={() => setMenuShow(false)}>
                  <Link
                    href={menu.link}
                    className="flex items-center p-2 text-white rounded-lg hover:bg-white hover:text-primary dark:hover:bg-gray-700 group"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
