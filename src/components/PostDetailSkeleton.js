import React from 'react';

function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white py-8 animate-pulse">
      {/* 프로필 영역 스켈레톤 */}
      <div className="max-w-[560px] mx-auto px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-[36px] h-[36px] rounded-full bg-gray-300" />
            <div className="flex flex-col space-y-2">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-3 w-40 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full">
        <div className="h-[1px] bg-gray-200" />
      </div>

      {/* 콘텐츠 영역 스켈레톤 */}
      <div className="w-full bg-gray-50 px-4 py-4">
        <div className="max-w-[560px] mx-auto space-y-4">
          <div className="h-6 w-64 bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-5/6 bg-gray-300 rounded" />
        </div>
      </div>

      {/* 액션 버튼 영역 스켈레톤 */}
      <div className="w-full bg-gray-50 px-4 pb-5 mt-4">
        <div className="max-w-[560px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-[24px] h-[24px] bg-gray-300 rounded-full" />
                <div className="h-4 w-6 bg-gray-300 rounded" />
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-[24px] h-[24px] bg-gray-300 rounded-full" />
                <div className="h-4 w-6 bg-gray-300 rounded" />
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-[24px] h-[24px] bg-gray-300 rounded-full" />
                <div className="h-4 w-8 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="w-[24px] h-[24px] bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* 댓글 영역 스켈레톤 */}
      <div className="max-w-[560px] mx-auto mt-4 bg-gray-50 rounded-2xl space-y-4 px-4 py-6">
        {/* 여기서는 3개의 댓글 자리 표시용 요소를 렌더링 */}
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-1/2 bg-gray-300 rounded" />
            <div className="h-3 w-full bg-gray-300 rounded" />
            <div className="h-3 w-5/6 bg-gray-300 rounded" />
            {index !== 2 && <div className="h-[1px] bg-gray-200 my-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetailSkeleton; 