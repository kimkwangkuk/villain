'use client';

import React from 'react';

const PostCardSkeleton = () => {
  return (
    <div className="block rounded-lg transition-colors duration-200">
      <div className="flex flex-col h-full">
        <div className="bg-[#F5F5F7] dark:bg-[#0A0A0A] rounded-2xl pt-[14px] p-5 pb-3 flex flex-col h-[360px]">
          {/* 프로필 영역 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-neutral-800 dark-pulse"></div>
              <div className="ml-2">
                <div className="h-[13px] w-24 bg-gray-300 dark:bg-neutral-800 rounded mb-1 dark-pulse"></div>
                <div className="flex items-center">
                  <div className="h-[12px] w-16 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                  <div className="mx-1 h-[12px] text-gray-500 dark:text-neutral-500">·</div>
                  <div className="h-[12px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-neutral-800 dark-pulse"></div>
          </div>

          {/* 타이틀 */}
          <div className="h-[19px] w-3/4 bg-gray-300 dark:bg-neutral-800 rounded mb-[6px] dark-pulse"></div>

          {/* 콘텐츠 */}
          <div className="space-y-2">
            <div className="h-[15px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[15px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[15px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[15px] w-3/4 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[15px] w-1/2 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
          </div>

          {/* 좋아요/댓글 수 */}
          <div className="mt-auto flex items-center justify-between text-[14px] text-gray-500 dark:text-neutral-500 pb-3">
            <div className="h-[14px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[14px] w-16 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-900 pt-3 -mx-5 px-5">
            <div className="h-[22px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[22px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            <div className="h-[22px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
          </div>
        </div>
      </div>

      {/* 다크모드용 커스텀 애니메이션 */}
      <style jsx>{`
        @keyframes darkPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .dark-pulse {
          animation: darkPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @media (prefers-color-scheme: dark) {
          .animate-pulse {
            animation: none;
          }
        }
        
        :root.dark .animate-pulse {
          animation: none;
        }
      `}</style>
    </div>
  );
};

export default PostCardSkeleton; 