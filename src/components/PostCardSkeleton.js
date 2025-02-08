import React from 'react';

function PostCardSkeleton() {
  return (
    <div className="block rounded-lg transition-colors duration-200 animate-pulse">
      <div className="flex flex-col h-full">
        {/* 컨텐츠 영역 */}
        <div className="bg-gray-100 rounded-2xl p-5 flex flex-col h-[300px]">
          <div>
            {/* 카테고리 레이블 자리 */}
            <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
              <div className="w-4 h-4 mr-2 bg-gray-300 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
            {/* 타이틀 자리 */}
            <div
              className="h-6 w-3/4 bg-gray-300 rounded mb-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '1',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            ></div>
            {/* 내용 자리 – 최대 5줄 표시 */}
            <div
              className="space-y-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '5',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              <div className="h-4 w-full bg-gray-300 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
            </div>
          </div>
          {/* 좋아요/댓글 버튼 자리 */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        {/* 프로필 영역 자리 */}
        <div className="rounded-b-xl flex items-center bg-transparent pt-[10px]">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gray-300 rounded-full"></div>
          </div>
          <div className="ml-3">
            <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCardSkeleton; 