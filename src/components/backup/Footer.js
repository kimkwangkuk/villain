import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex space-x-6">
            <Link 
              to="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              개인정보 처리방침
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              서비스 이용약관
            </Link>
          </div>
          <div className="text-sm text-gray-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Villain. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 