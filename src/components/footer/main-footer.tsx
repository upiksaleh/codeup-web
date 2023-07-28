'use client';

import GithubIcon from '../icons/github';
import TwitterIcon from '../icons/twitter';

export default function MainFooter() {
  return (
    <footer>
      <div className="base-container">
        <div className="flex justify-between">
          <div>&copy; 2023</div>
          <div className="flex items-center gap-4 ">
            <a href="https://github.com/upiksaleh" target="_blank">
              <GithubIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </a>
            <a href="https://twitter.com/alrahmsa" target="_blank">
              <TwitterIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
