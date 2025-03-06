import React from 'react';

function PostDetailSkeleton() {
  return (
    <div className="bg-white py-8 animate-pulse">
      {/* 프로필과 콘텐츠를 감싸는 컨테이너 */}
      <div className="w-full px-4">
        <div className="max-w-[580px] mx-auto bg-gray-100 rounded-2xl">
          {/* 프로필 영역 */}
          <div className="pb-[0px] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="ml-2">
                  <div className="h-[13px] w-24 bg-gray-300 rounded mb-1"></div>
                  <div className="flex items-center">
                    <div className="h-[12px] w-16 bg-gray-300 rounded"></div>
                    <div className="mx-1 h-[12px] text-gray-500">·</div>
                    <div className="h-[12px] w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="pt-[0px] p-4">
            <div className="pt-3 pb-6">
              <div className="h-[20px] w-3/4 bg-gray-300 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-[16px] w-full bg-gray-300 rounded"></div>
                <div className="h-[16px] w-full bg-gray-300 rounded"></div>
                <div className="h-[16px] w-3/4 bg-gray-300 rounded"></div>
                <div className="h-[16px] w-1/2 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* 좋아요/댓글 수 */}
            <div className="flex items-center justify-between text-[14px] text-gray-500 pb-3">
              <div className="h-[14px] w-20 bg-gray-300 rounded"></div>
              <div className="h-[14px] w-16 bg-gray-300 rounded"></div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 -mx-4 px-4">
              <div className="h-[22px] w-20 bg-gray-300 rounded"></div>
              <div className="h-[22px] w-20 bg-gray-300 rounded"></div>
              <div className="h-[22px] w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="w-full px-4 mt-4">
        <div className="max-w-[580px] mx-auto">
          {/* 댓글 입력 영역 */}
          <div className="bg-gray-100 rounded-2xl">
            <div className="p-[12px] w-full">
              <div className="flex items-center space-x-2">
                <div className="w-[30px] h-[30px] rounded-full bg-gray-300"></div>
                <div className="flex-1 h-[24px] bg-gray-300 rounded"></div>
                <div className="w-[60px] h-[32px] bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* 댓글 리스트 영역 */}
          <div className="mt-4 bg-gray-100 rounded-2xl">
            {[1, 2, 3].map((_, index) => (
              <div key={index}>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <div className="ml-2">
                      <div className="h-[13px] w-24 bg-gray-300 rounded mb-1"></div>
                      <div className="h-[12px] w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 ml-10">
                    <div className="h-[15px] w-full bg-gray-300 rounded"></div>
                    <div className="h-[15px] w-3/4 bg-gray-300 rounded"></div>
                  </div>
                </div>
                {index !== 2 && <div className="h-[1px] bg-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailSkeleton; 