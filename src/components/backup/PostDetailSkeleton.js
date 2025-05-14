import React from 'react';

function PostDetailSkeleton() {
  return (
    <div className="bg-white dark:bg-black min-h-screen pb-8">
      {/* 프로필과 콘텐츠를 감싸는 컨테이너 */}
      <div className="w-full px-4">
        <div className="max-w-[590px] mx-auto bg-gray-100 dark:bg-[#121212] rounded-2xl">
          {/* 프로필 영역 */}
          <div className="pb-[0px] p-4">
            <div className="flex items-center justify-between">
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
          </div>

          {/* 콘텐츠 영역 */}
          <div className="pt-[0px] p-4 pb-0">
            <div className="pt-3 pb-6">
              <div className="h-[20px] w-3/4 bg-gray-300 dark:bg-neutral-800 rounded mb-2 dark-pulse"></div>
              <div className="space-y-2">
                <div className="h-[16px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                <div className="h-[16px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                <div className="h-[16px] w-3/4 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                <div className="h-[16px] w-1/2 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
              </div>
            </div>

            {/* 좋아요/댓글 수 표시 */}
            <div className="flex items-center justify-between text-[14px] text-gray-500 dark:text-neutral-500 pb-3">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-1">
                  <div className="w-5 h-5 bg-gray-300 dark:bg-neutral-800 rounded-full dark-pulse"></div>
                </div>
                <div className="h-[14px] w-20 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
              </div>
              <div className="h-[14px] w-16 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
            </div>

            {/* 좋아요/댓글/공유 버튼 컨테이너 */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-900 py-2 -mx-4 px-4">
              {/* 반응 버튼 */}
              <div className="h-[36px] w-[80px] bg-gray-300 dark:bg-neutral-800 rounded-full dark-pulse"></div>
              
              {/* 댓글 버튼 - 중앙 고정 */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className="h-[36px] w-[80px] bg-gray-300 dark:bg-neutral-800 rounded-full dark-pulse"></div>
              </div>

              {/* 공유 버튼 */}
              <div className="h-[36px] w-[80px] bg-gray-300 dark:bg-neutral-800 rounded-full dark-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 영역 전체를 감싸는 컨테이너 */}
      <div className="w-full px-4 mt-4">
        <div className="max-w-[590px] mx-auto">
          {/* 댓글 입력 영역 */}
          <div className="bg-gray-100 dark:bg-[#121212] rounded-2xl">
            <div className="bg-gray-100 dark:bg-[#121212] rounded-2xl p-[12px] w-full">
              <div className="flex items-center space-x-2">
                <div className="w-[30px] h-[30px] rounded-full bg-gray-300 dark:bg-neutral-800 flex-shrink-0 dark-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 w-full">
                    <div className="flex-1 h-[24px] bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                    <div className="flex-shrink-0 w-[60px] h-[32px] bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 리스트 영역 */}
          <div className="mt-4 bg-gray-100 dark:bg-[#121212] rounded-2xl">
            {[1, 2, 3].map((_, index) => (
              <div key={index}>
                <div className="py-[16px]">
                  {/* 상단 영역: 프로필 정보와 더보기 버튼 */}
                  <div className="flex justify-between items-start px-[20px]">
                    {/* 프로필 정보 그룹 */}
                    <div className="flex items-center space-x-[6px]">
                      <div className="w-[20px] h-[20px] rounded-full bg-gray-300 dark:bg-neutral-800 dark-pulse"></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="h-[13px] w-24 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                          <div className="h-[13px] w-24 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-neutral-800 dark-pulse"></div>
                  </div>

                  {/* 댓글 내용 */}
                  <div className="mt-1 px-[20px]">
                    <div className="h-[15px] w-full bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                    <div className="h-[15px] w-3/4 mt-1 bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                  </div>

                  {/* 좋아요/답글 버튼 영역 */}
                  <div className="mt-2 flex items-center space-x-4 px-[20px]">
                    <div className="h-[18px] w-[60px] bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                    <div className="h-[18px] w-[60px] bg-gray-300 dark:bg-neutral-800 rounded dark-pulse"></div>
                  </div>
                </div>
                {index !== 2 && <div className="h-[1px] bg-gray-200 dark:bg-neutral-800"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 다크모드용 커스텀 애니메이션 */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
}

export default PostDetailSkeleton; 