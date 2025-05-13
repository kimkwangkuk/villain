'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/api/categories';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import PostCard from '@/components/PostCard';
import { useRouter, redirect } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  categoryId: string;
  createdAt: any;
  updatedAt?: any;
  likes: number;
  likedBy?: string[];
  commentCount: number;
}

export default function Page() {
  redirect('/home');
}

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 카테고리 가져오기
        const categoriesData = await getCategories();
        setCategories(categoriesData as Category[]);
        
        // 최근 게시물 가져오기
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || 0,
          commentCount: doc.data().commentCount || 0,
          authorName: doc.data().authorName || '익명'
        }));
        
        setPosts(postsData as Post[]);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleShare = (postId: string) => {
    // 공유 기능 구현
    alert('공유 기능은 준비 중입니다.');
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">빌런에 오신 것을 환영합니다</h1>
        
        {loading ? (
          <p className="text-center">게시물을 불러오는 중...</p>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                categories={categories}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <p className="text-center">게시물이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
