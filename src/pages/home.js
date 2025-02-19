import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getCategories, getUserDoc } from '../api/firebase';
import PostCard from '../components/PostCard';
import { 
  AllCategoryIcon, 
  CategoryIcon1, 
  CategoryIcon2, 
  CategoryIcon3, 
  CategoryIcon4, 
  HospitalIcon,
  SchoolIcon,
  CategoryIcon6, 
  CategoryIcon7, 
  CategoryIcon8, 
  CategoryIcon9 
} from '../components/Icons';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// firestore 쿼리를 위해 추가
import { db } from '../firebase';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import PostCardSkeleton from '../components/PostCardSkeleton';

// 홈 페이지 상단에 객체로 카테고리 아이콘 매핑
const categoryIconMapping = {
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

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [user, setUser] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // useSearchParams 훅 사용 (쿼리 파라미터 관리)
  const [searchParams, setSearchParams] = useSearchParams();

  // 컴포넌트 mount 시 query parameter에서 카테고리 값을 가져옵니다.
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  // 사용자 인증 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 기존에 분리되어 있던 "카테고리 불러오기"와 "게시글 초기 로드" useEffect를 하나로 통합하여 동시에 불러옴
  useEffect(() => {
    const initLoad = async () => {
      try {
        const [categoriesData] = await Promise.all([
          getCategories(), 
          loadPosts() // posts 불러오기 함수
        ]);
        setCategories(categoriesData);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
      setLoading(false);
    };
    initLoad();
  }, []);

  // 페이지당 불러올 게시글 수
  const postsPerPage = 20;

  // 게시글 불러오는 함수 (무한 스크롤용)
  const loadPosts = async () => {
    try {
      let q;
      if (lastDoc) {
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
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
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

  // 게시글이 변경될 때 저자 정보 업데이트
  useEffect(() => {
    const fetchAuthors = async () => {
      const uniqueAuthorIds = [...new Set(posts.map(post => post.authorId))];
      try {
        const authorPromises = uniqueAuthorIds.map(id => getUserDoc(id));
        const authorData = await Promise.all(authorPromises);
        setAuthors(
          authorData.map((data, index) => ({
            id: uniqueAuthorIds[index],
            name: data.username || '이름 없음',
            profile: data.photoURL
          }))
        );
      } catch (error) {
        console.error('저자 로딩 실패:', error);
      }
    };
    if (posts.length > 0) {
      fetchAuthors();
    }
  }, [posts]);

  // 추가 게시글 로드 (무한 스크롤)
  const loadMorePosts = async () => {
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, lastDoc]);

  // 선택한 카테고리에 따른 필터링
  const filteredPosts = selectedCategory
    ? posts.filter(post => post.categoryId === selectedCategory)
    : posts;

  const getDefaultProfileImage = (authorId) => {
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${authorId}&backgroundColor=e8f5e9`;
  };

  // 로딩 상태일 때 스켈레톤 UI 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* 카테고리 네비게이션 스켈레톤 */}
        <div>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex space-x-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-16 h-6 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* 저자 영역 스켈레톤 */}
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded animate-pulse mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 포스트 카드 영역 스켈레톤 */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 카테고리 영역 (개별 배경 제거) */}
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center overflow-x-auto whitespace-nowrap pt-16 px-4 gap-8 hide-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchParams({}); // 전체 선택 시 query parameter 초기화
              }}
              className={`text-[14px] pb-2 px-1 transition-colors ${
                !selectedCategory
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              <div className="flex flex-col items-center gap-[10px]">
                <AllCategoryIcon className="w-[28px] h-[28px]" />
                <span>전체</span>
              </div>
            </button>
            {categories.map((category) => {
              const IconComponent = categoryIconMapping[`order${category.order}`] || AllCategoryIcon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchParams({ category: category.id });
                  }}
                  className={`text-[14px] pb-2 px-1 transition-colors ${
                    selectedCategory === category.id
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500"
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

      {/* 카드 리스트 영역 (별도 배경 제거) */}
      <div className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} categories={categories} />
            ))}
          </div>
          {loadingMore && <div className="text-center mt-4">Loading more posts...</div>}
          {!hasMore && <div className="text-center mt-4">더 이상 게시글이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}

export default HomePage; 