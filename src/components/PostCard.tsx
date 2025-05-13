'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, Category } from '@/api/firebase';
import { db } from '@/firebase/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { detectUrls } from '@/utils/urlUtils';
import { reactions } from '@/data/reactions';
import { useAuth } from '@/hooks/useAuth';

// dayjs 설정
dayjs.locale('ko');

interface PostCardProps {
  post: Post;
  categories: Category[];
  onShare: (e: any, postId: string) => void;
}

const PostCard = ({ post, categories, onShare }: PostCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<{[key: string]: number}>({});
  
  // 게시물 반응 구독
  useEffect(() => {
    const reactionsRef = collection(db, 'posts', post.id, 'reactions');
    const q = query(reactionsRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: {[key: string]: number} = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        counts[data.type] = (counts[data.type] || 0) + 1;
      });
      
      setReactionCounts(counts);
    });
    
    return () => unsubscribe();
  }, [post.id]);
  
  // 포스트 생성 날짜 포맷팅
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '날짜 없음';
    
    try {
      const date = new Date(timestamp.seconds * 1000);
      return dayjs(date).format('YYYY년 MM월 DD일');
    } catch (e) {
      return '날짜 형식 오류';
    }
  };

  // URL 감지
  const hasUrl = post.content ? detectUrls(post.content).length > 0 : false;

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-neutral-900 h-full">
        <div className="p-5">
          {/* 카테고리 표시 */}
          <div className="mb-2">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {post.categoryName || '카테고리 없음'}
            </span>
          </div>
          
          {/* 제목 */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-black dark:text-white">
            {post.title}
          </h3>
          
          {/* 콘텐츠 미리보기 */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.content}
            {hasUrl && (
              <span className="text-blue-500 ml-1">🔗</span>
            )}
          </p>
          
          {/* 작성자 및 날짜 정보 */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span>{post.authorName || '익명'}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            
            {/* 반응 및 댓글 수 */}
            <div className="flex items-center gap-2">
              {Object.keys(reactionCounts).length > 0 ? (
                <div className="flex items-center">
                  {Object.entries(reactionCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([type, count]) => {
                      const reaction = reactions.find(r => r.id === type);
                      return (
                        <div key={type} className="flex items-center mr-2">
                          <span className="mr-1">{reaction?.emoji || '❤️'}</span>
                          <span>{count}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-1">❤️</span>
                  <span>{post.likes || 0}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="mr-1">💬</span>
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
          </div>
          
          {/* 공유 버튼 */}
          <div className="mt-3 text-right">
            <button 
              onClick={(e) => onShare(e, post.id)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              공유
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard; 