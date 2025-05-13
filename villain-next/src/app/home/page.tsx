'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCategories, Category, Post } from '@/api/firebase-post';
import { getUserDoc } from '@/api/firebase-user';
import PostCard from '@/components/PostCard';
import { 
  AllCategoryIcon, 
  HospitalIcon,
  SchoolIcon
} from '@/components/Icons';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// firestore 쿼리
import { db } from '@/firebase/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, where, QueryDocumentSnapshot } from 'firebase/firestore';
import PostCardSkeleton from '@/components/PostCardSkeleton';

// 홈 페이지 상단에 객체로 카테고리 아이콘 매핑
const categoryIconMapping: Record<string, React.FC<{className?: string}>> = {
  'order1': HospitalIcon,
  'order2': HospitalIcon,
  'order3': HospitalIcon,
  'order4': HospitalIcon,
  'order5': HospitalIcon,
  'order6': SchoolIcon,
  'order7': HospitalIcon,
  'order8': HospitalIcon,
  'order9': HospitalIcon,
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [authors, setAuthors] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [cachedLastDocId, setCachedLastDocId] = useState<string | null>(null);
  const [noPostsMessage, setNoPostsMessage] = useState(false);
  const [previousPosts, setPreviousPosts] = useState<Post[]>([]);
  
  // 현재 진행 중인 요청을 추적하기 위한 ref
  const currentRequestRef = useRef<AbortController | null>(null);

  // Next.js의 useSearchParams 훅 사용
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const prevPathRef = useRef('');

  // 드래그 스크롤을 위한 상태와 ref 추가
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 스크롤 위치 저장
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 경로 변경 감지
  useEffect(() => {
    // 컴포넌트 마운트 시 초기화
    if (prevPathRef.current === '') {
      prevPathRef.current = window.location.pathname + window.location.search;
      
      // 세션 스토리지에서 이전 페이지 경로 확인
      const lastVisitedPath = sessionStorage.getItem('lastVisitedPath');
      if (lastVisitedPath && lastVisitedPath.includes('/posts/')) {
        // 포스트 상세 페이지에서 돌아온 경우
        setIsBackNavigation(true);
        setIsRestoringState(true);
        
        // 캐시된 포스트 데이터 복원
        const cachedPosts = sessionStorage.getItem('cachedPosts');
        if (cachedPosts) {
          try {
            const parsedPosts = JSON.parse(cachedPosts);
            setPosts(parsedPosts);
            
            // 마지막 문서 ID 저장
            const lastDocId = sessionStorage.getItem('cachedLastDocId');
            if (lastDocId) {
              setCachedLastDocId(lastDocId);
            }
            
            // 로딩 상태 업데이트
            setLoading(false);
          } catch (error) {
            console.error('캐시된 데이터 복원 실패:', error);
          }
        }
      }
    }
    
    // 현재 경로 저장
    sessionStorage.setItem('lastVisitedPath', window.location.pathname + window.location.search);
    
    return () => {
      // 컴포넌트 언마운트 시 현재 경로 저장
      sessionStorage.setItem('lastVisitedPath', window.location.pathname + window.location.search);
    };
  }, []);
  
  // 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      setIsBackNavigation(true);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // 컴포넌트 마운트 시 query parameter에서 카테고리 값을 가져옵니다.
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(null);
    }
    
    // 카테고리 변경 시 스크롤 위치 초기화 (뒤로가기가 아닌 경우)
    if (!isBackNavigation) {
      window.scrollTo(0, 0);
    }
    
    // 카테고리 변경 시 카테고리 UI가 스켈레톤으로 표시되지 않도록 함
    setCategoriesLoading(false);
  }, [categoryParam, isBackNavigation]);

  // 카테고리 초기 로드 시 스크롤 위치 초기화
  useEffect(() => {
    if (categoryScrollRef.current) {
      // 초기에는 스크롤 위치를 0으로 설정
      categoryScrollRef.current.scrollLeft = 0;
    }
  }, []);

  // 사용자 인증 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 기존에 분리되어 있던 "카테고리 불러오기"와 "게시글 초기 로드" useEffect를 하나로 통합하여 동시에 불러옴
  useEffect(() => {
    // 이미 상태 복원 중이면 초기 로드 건너뛰기
    if (isRestoringState) {
      return;
    }
    
    const initLoad = async () => {
      try {
        // 카테고리 먼저 로드하여 UI가 스켈레톤으로 표시되지 않도록 함
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setCategoriesLoading(false);
        
        // 그 다음 포스트 로드
        await loadPosts();
        setPostsLoading(false);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setCategoriesLoading(false);
        setPostsLoading(false);
      }
      setLoading(false);
      
      // 페이지 로드 후 스크롤 위치 확인하여 필요시 추가 포스트 로드
      setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
          loadMorePosts();
        }
      }, 500);
    };
    
    initLoad();
  }, [isRestoringState]);

  // 페이지당 불러올 게시글 수
  const postsPerPage = 20;

  // 게시글 불러오는 함수 (무한 스크롤용)
  const loadPosts = async () => {
    if (loadingMore) return; // 이미 로딩 중이면 중복 호출 방지
    
    try {
      let q;
      
      // 선택된 카테고리가 있는 경우
      if (selectedCategory) {
        if (lastDoc) {
          q = query(
            collection(db, 'posts'),
            where('categoryId', '==', selectedCategory),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(postsPerPage)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            where('categoryId', '==', selectedCategory),
            orderBy('createdAt', 'desc'),
            limit(postsPerPage)
          );
        }
      } 
      // 전체 카테고리 선택 시
      else {
        // 캐시된 lastDocId가 있고 lastDoc이 없는 경우, 해당 ID로 문서 가져오기
        if (cachedLastDocId && !lastDoc) {
          // 캐시된 ID로 마지막 문서 복원
          const docRef = doc(db, 'posts', cachedLastDocId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // 복원된 문서로 쿼리 생성
            q = query(
              collection(db, 'posts'),
              orderBy('createdAt', 'desc'),
              startAfter(docSnap),
              limit(postsPerPage)
            );
            
            // 캐시된 ID 초기화
            setCachedLastDocId(null);
          } else {
            // 문서가 없으면 처음부터 로드
            q = query(
              collection(db, 'posts'),
              orderBy('createdAt', 'desc'),
              limit(postsPerPage)
            );
          }
        } else if (lastDoc) {
          q = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(postsPerPage)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(postsPerPage)
          );
        }
      }
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 중복 포스트 제거
      const existingPostIds = new Set(posts.map(post => post.id));
      const uniqueNewPosts = newPosts.filter(post => !existingPostIds.has(post.id));
      
      if (uniqueNewPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...(uniqueNewPosts as Post[])]);
      }
      
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      if (newPosts.length < postsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('포스트 로딩 실패:', error);
    }
  };

  // 추가 게시글 로드 (무한 스크롤)
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || postsLoading) return; // 이미 로딩 중이거나 더 이상 포스트가 없으면 중단
    
    setLoadingMore(true);
    await loadPosts();
    setLoadingMore(false);
  };

  // 스크롤 이벤트로 추가 로드 트리거
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    // 컴포넌트 마운트 시 현재 스크롤 위치 확인
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMorePosts();
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, lastDoc]);

  // 카테고리 변경 처리
  const handleCategoryChange = (category: string | null) => {
    // URLSearchParams를 사용하여 URL 파라미터 업데이트
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url);
    
    setSelectedCategory(category);
  };

  // 선택한 카테고리에 따른 필터링 및 결과가 없을 때 처리
  const filteredPosts = selectedCategory
    ? (postsLoading ? previousPosts.filter(post => post.categoryId === selectedCategory) : posts.filter(post => post.categoryId === selectedCategory))
    : (postsLoading ? previousPosts : posts);
    
  // 중복 ID 제거를 위한 처리
  const uniqueFilteredPosts = Array.from(
    new Map(filteredPosts.map(post => [post.id, post])).values()
  );

  const handleShare = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/postdetail/${postId}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  // 로딩 상태일 때 스켈레톤 UI 처리
  if (categoriesLoading && !categories.length) {
    // 카테고리가 로딩 중이고 카테고리 데이터가 없을 때만 카테고리 스켈레톤 표시
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        {/* 카테고리 네비게이션 스켈레톤 */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-800 sticky top-16 z-40">
          <div className="max-w-[1200px] mx-auto relative">
            <div className="flex overflow-x-auto whitespace-nowrap pt-4 md:pt-10 px-4 gap-5 md:gap-6 lg:gap-8 pb-2 cursor-grab select-none hide-scrollbar">
              <button
                className="text-[14px] pb-2 px-1 transition-colors text-black dark:text-white border-b-2 border-black dark:border-white"
              >
                <div className="flex flex-col items-center gap-[10px]">
                  <AllCategoryIcon className="w-[28px] h-[28px]" />
                  <span>전체</span>
                </div>
              </button>
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  className="text-[14px] pb-2 px-1 transition-colors text-gray-500 dark:text-neutral-500"
                >
                  <div className="flex flex-col items-center gap-[10px]">
                    <div className="w-[28px] h-[28px] bg-gray-300 dark:bg-neutral-900 rounded animate-pulse"></div>
                    <span className="w-16 h-4 bg-gray-300 dark:bg-neutral-900 rounded animate-pulse"></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 포스트 카드 영역 스켈레톤 */}
        <div className="py-8 md:pt-[50px]">
          <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* 헤더 영역 */}
      <div className="sticky top-16 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-900">
        {/* 카테고리 영역 (네비게이션바) */}
        <div className="max-w-[1200px] mx-auto">
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto whitespace-nowrap pt-4 md:pt-10 px-4 gap-5 md:gap-6 lg:gap-8 cursor-grab select-none hide-scrollbar bg-white dark:bg-black"
          >
            <button
              onClick={() => handleCategoryChange(null)}
              data-category="all"
              className={`text-[14px] pb-3 px-1 transition-colors ${
                !selectedCategory
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-black dark:text-white"
              }`}
            >
              <div className="flex flex-col items-center gap-[10px]">
                <AllCategoryIcon className="w-[28px] h-[28px]" />
                <span>전체</span>
              </div>
            </button>
            {categories.map((category) => {
              const IconComponent = categoryIconMapping[`order${category.order || 0}`] || AllCategoryIcon;
              return (
                <button
                  key={category.id}
                  data-category={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`text-[14px] pb-3 px-1 transition-colors ${
                    selectedCategory === category.id
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-black dark:text-white"
                  }`}
                >
                  <div className="flex flex-col items-center gap-[10px]">
                    <IconComponent className="w-[28px] h-[28px]" />
                    <span>{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="bg-white dark:bg-black transition-colors duration-200">
        {/* 카드 리스트 영역 */}
        <div className="pt-[20px] md:pt-[50px] pb-8 bg-white dark:bg-black">
          <div className="max-w-[1200px] mx-auto px-4">
            {postsLoading ? (
              // 포스트 로딩 중일 때만 포스트 영역 스켈레톤 표시
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PostCardSkeleton key={index} />
                ))}
              </div>
            ) : uniqueFilteredPosts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-neutral-400">게시글이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {uniqueFilteredPosts.map((post) => (
                  <PostCard 
                    key={`post-${post.id}`} 
                    post={post as any} 
                    categories={categories}
                    onShare={handleShare as any}
                  />
                ))}
              </div>
            )}
            {/* 로딩 중이 아니고 추가 로딩 중이며 포스트가 있을 때만 로딩 스피너 표시 */}
            {loadingMore && !postsLoading && uniqueFilteredPosts.length > 0 && (
              <div className="text-center mt-6 py-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* 하단 영역 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-10">
          {/* 토스트 메시지 */}
          {showToast && (
            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-neutral-900 text-white px-4 py-2 rounded-lg z-50">
              링크가 복사되었습니다!
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 