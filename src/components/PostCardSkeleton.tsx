import React from 'react';

const PostCardSkeleton = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-neutral-900 h-full animate-pulse">
      <div className="p-5">
        {/* 카테고리 */}
        <div className="mb-2">
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/4"></div>
        </div>
        
        {/* 제목 */}
        <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-full mb-2"></div>
        
        {/* 콘텐츠 미리보기 */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
        </div>
        
        {/* 작성자 및 날짜 정보 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-20"></div>
          </div>
          
          {/* 좋아요 및 댓글 수 */}
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-10"></div>
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-10"></div>
          </div>
        </div>
        
        {/* 공유 버튼 */}
        <div className="mt-3 text-right">
          <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-10 ml-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton; 