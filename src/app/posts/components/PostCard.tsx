'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  categoryId?: string;
  likes?: number;
  likedBy?: string[];
  reactionCount?: number;
  commentCount?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface PostCardProps {
  post: Post;
  categories?: Category[];
  onShare: (e: any, postId: string) => void;
}

const PostCard = ({ post, categories, onShare }: PostCardProps) => {
  const [categoryName, setCategoryName] = useState('');
  
  useEffect(() => {
    // prop으로 전달된 categories 배열에서 해당 post의 카테고리를 찾습니다.
    if (categories && categories.length > 0) {
      const category = categories.find(cat => cat.id === post.categoryId);
      if (category) {
        setCategoryName(category.name);
      }
    }
  }, [categories, post.categoryId]);

  const getRelativeTime = (date: Date) => {
    return dayjs(date).fromNow();
  };

  const getDefaultProfileImage = () => {
    return 'https://via.placeholder.com/150?text=' + (post.authorName?.charAt(0) || '?');
  };

  // 게시글 내용을 일정 길이로 제한하는 함수
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Link href={`/posts/${post.id}`} className="block rounded-lg transition-colors duration-200">
      <div className="flex flex-col h-full">
        <div className="bg-[#F5F5F7] dark:bg-[#121212] rounded-2xl pt-[14px] p-5 pb-2 flex flex-col h-[360px] hover:bg-[#EBEBED] dark:hover:bg-[#1A1A1A] transition-colors duration-200">
          {/* 프로필 영역 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={post.authorPhotoURL || getDefaultProfileImage()}
                  alt={`${post.authorName}의 프로필`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 이니셜 표시
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentNode as HTMLElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          ${post.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>`;
                    }
                  }}
                />
              </div>
              <div className="ml-2">
                <div className="text-[13px] font-medium text-black dark:text-white">
                  {post.authorName || '익명'}
                </div>
                <div className="flex items-center text-[12px] text-gray-500 dark:text-neutral-500">
                  <span>{categoryName || '카테고리 없음'}</span>
                  <span className="mx-1">·</span>
                  <span>{post.createdAt ? getRelativeTime(post.createdAt.toDate()) : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 타이틀 */}
          <h3 className="text-[19px] font-bold text-black dark:text-white mb-[6px] line-clamp-2">
            {post.title}
          </h3>

          {/* 콘텐츠 */}
          <div className="text-[15px] text-gray-700 dark:text-neutral-300 line-clamp-5 mb-4">
            {truncateContent(post.content)}
          </div>

          {/* 좋아요/댓글 수 */}
          <div className="mt-auto flex items-center justify-between text-[14px] text-gray-500 dark:text-neutral-500 pb-3">
            <div className="flex items-center">
              <span>좋아요 {post.likes || 0}</span>
            </div>
            <div>댓글 {post.commentCount || 0}</div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-900 pt-3 -mx-5 px-5">
            <button 
              className="flex items-center text-[14px] text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
              onClick={(e) => e.preventDefault()}
            >
              <span>좋아요</span>
            </button>
            <button 
              className="flex items-center text-[14px] text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
              onClick={(e) => e.preventDefault()}
            >
              <span>댓글</span>
            </button>
            <button 
              className="flex items-center text-[14px] text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
              onClick={(e) => onShare(e, post.id)}
            >
              <span>공유</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard; 