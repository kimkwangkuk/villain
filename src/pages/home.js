import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
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
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, where } from 'firebase/firestore';
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [user, setUser] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [cachedLastDocId, setCachedLastDocId] = useState(null);
  const [noPostsMessage, setNoPostsMessage] = useState(false); // 게시글 없음 메시지 표시 여부
  const [previousPosts, setPreviousPosts] = useState([]); // 이전 포스트 저장
  
  // 현재 진행 중인 요청을 추적하기 위한 ref
  const currentRequestRef = useRef(null);

  // useSearchParams 훅 사용 (쿼리 파라미터 관리)
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const prevPathRef = useRef('');

  // 드래그 스크롤을 위한 상태와 ref 추가
  const categoryScrollRef = useRef(null);
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
    // 이전 경로와 현재 경로 비교
    const currentPath = location.pathname + location.search;
    
    // 컴포넌트 마운트 시 초기화
    if (prevPathRef.current === '') {
      prevPathRef.current = currentPath;
      
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
            
            // 마지막 문서 ID 저장 (실제 lastDoc 객체는 나중에 복원)
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
    } else if (currentPath !== prevPathRef.current) {
      prevPathRef.current = currentPath;
    }
    
    // 현재 경로 저장
    sessionStorage.setItem('lastVisitedPath', currentPath);
    
    return () => {
      // 컴포넌트 언마운트 시 현재 경로 저장
      sessionStorage.setItem('lastVisitedPath', currentPath);
    };
  }, [location]);
  
  // 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      setIsBackNavigation(true);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // 뒤로가기 후 처리
  useEffect(() => {
    if (isBackNavigation) {
      // 뒤로가기 후 스크롤 위치 확인 및 추가 포스트 로드
      setTimeout(() => {
        // 저장된 스크롤 위치 복원
        const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
        if (savedScrollPosition && !isNaN(Number(savedScrollPosition))) {
          window.scrollTo(0, Number(savedScrollPosition));
        }
        
        // 화면에 포스트가 충분히 표시되지 않으면 추가 로드
        setTimeout(() => {
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadMorePosts();
          }
          setIsBackNavigation(false);
          setIsRestoringState(false);
        }, 100);
      }, 50);
    }
  }, [isBackNavigation]);

  // 페이지 이동 시 스크롤 위치와 데이터 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 스크롤 위치 저장
      sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
      sessionStorage.setItem('selectedCategory', selectedCategory || '');
      
      // 포스트 데이터 캐싱
      if (posts.length > 0) {
        sessionStorage.setItem('cachedPosts', JSON.stringify(posts));
        if (lastDoc) {
          // lastDoc 객체는 직렬화할 수 없으므로 ID만 저장
          sessionStorage.setItem('cachedLastDocId', lastDoc.id);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 페이지 이동 시에도 스크롤 위치와 데이터 저장
    return () => {
      sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
      sessionStorage.setItem('selectedCategory', selectedCategory || '');
      
      // 포스트 데이터 캐싱
      if (posts.length > 0) {
        sessionStorage.setItem('cachedPosts', JSON.stringify(posts));
        if (lastDoc) {
          // lastDoc 객체는 직렬화할 수 없으므로 ID만 저장
          sessionStorage.setItem('cachedLastDocId', lastDoc.id);
        }
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scrollPosition, selectedCategory, posts, lastDoc]);

  // 컴포넌트 마운트 시 query parameter에서 카테고리 값을 가져옵니다.
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    } else {
      setSelectedCategory(null);
    }
    
    // 카테고리 변경 시 스크롤 위치 초기화 (뒤로가기가 아닌 경우)
    if (!isBackNavigation) {
      window.scrollTo(0, 0);
    }
    
    // 카테고리 변경 시 카테고리 UI가 스켈레톤으로 표시되지 않도록 함
    setCategoriesLoading(false);
  }, [searchParams, isBackNavigation]);

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

  // 카테고리 데이터 로드 (상태 복원 시에도 필요)
  useEffect(() => {
    // 이미 카테고리가 로드되어 있으면 스킵
    if (categories.length > 0) {
      setCategoriesLoading(false);
      return;
    }
    
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setCategoriesLoading(false);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
        setCategoriesLoading(false);
      }
    };
    
    loadCategories();
  }, [categories.length]);

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
        setPosts(prevPosts => [...prevPosts, ...uniqueNewPosts]);
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

  // 카테고리 변경 감지 및 처리
  useEffect(() => {
    // 카테고리가 변경되었을 때 실행
    const handleCategoryChange = async () => {
      // 로딩 중이면 중복 실행 방지
      if (loadingMore) return;
      
      console.log('카테고리 변경:', selectedCategory);
      
      // 이전 요청 취소 (식별자 변경)
      const requestId = Date.now();
      currentRequestRef.current = requestId;
      
      // 현재 포스트를 이전 포스트로 저장
      setPreviousPosts(posts);
      
      // 카테고리 변경 시 상태 초기화 (포스트는 초기화하지 않음)
      setLastDoc(null);
      setHasMore(true);
      setPostsLoading(true); // 포스트 로딩 상태만 변경
      setNoPostsMessage(false);
      
      try {
        let q;
        
        // 카테고리별 쿼리 생성
        if (selectedCategory) {
          // 선택된 카테고리의 포스트만 로드
          q = query(
            collection(db, 'posts'),
            where('categoryId', '==', selectedCategory),
            orderBy('createdAt', 'desc'),
            limit(postsPerPage)
          );
        } else {
          // 전체 카테고리 포스트 로드
          q = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(postsPerPage)
          );
        }
        
        const snapshot = await getDocs(q);
        
        // 요청이 취소되었는지 확인
        if (currentRequestRef.current !== requestId) {
          console.log('요청 취소됨:', requestId);
          return;
        }
        
        const newPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 중복 제거
        const uniquePosts = Array.from(
          new Map(newPosts.map(post => [post.id, post])).values()
        );
        
        // 새 포스트로 업데이트
        setPosts(uniquePosts);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        
        if (newPosts.length < postsPerPage) {
          setHasMore(false);
        }
        
        // 포스트가 없는 경우 메시지 표시 (약간의 지연 후)
        if (uniquePosts.length === 0) {
          setTimeout(() => {
            // 요청이 취소되지 않았는지 다시 확인
            if (currentRequestRef.current === requestId) {
              setNoPostsMessage(true);
            }
          }, 300);
        }
      } catch (error) {
        console.error('카테고리 변경 시 포스트 로딩 실패:', error);
        // 요청이 취소되지 않았는지 확인
        if (currentRequestRef.current === requestId) {
          setNoPostsMessage(true);
        }
      } finally {
        // 요청이 취소되지 않았는지 확인
        if (currentRequestRef.current === requestId) {
          setPostsLoading(false);
        }
      }
    };
    
    // 카테고리 변경 시 실행
    handleCategoryChange();
  }, [selectedCategory]);

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

  // 선택한 카테고리에 따른 필터링 및 결과가 없을 때 처리
  const filteredPosts = selectedCategory
    ? (postsLoading ? previousPosts.filter(post => post.categoryId === selectedCategory) : posts.filter(post => post.categoryId === selectedCategory))
    : (postsLoading ? previousPosts : posts);
    
  // 중복 ID 제거를 위한 처리
  const uniqueFilteredPosts = Array.from(
    new Map(filteredPosts.map(post => [post.id, post])).values()
  );
  
  // 카테고리 변경 시 포스트 로딩 상태 관리
  useEffect(() => {
    // 카테고리 변경 시 필터링된 포스트가 없고 로딩 중이 아니면 추가 로드
    if (uniqueFilteredPosts.length === 0 && !postsLoading && !loadingMore && hasMore) {
      // 약간의 지연 후 추가 로드 (UI가 깜빡이는 것을 방지)
      const timer = setTimeout(() => {
        loadMorePosts();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, uniqueFilteredPosts.length, postsLoading, loadingMore, hasMore]);

  const getDefaultProfileImage = (authorId) => {
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${authorId}&backgroundColor=e8f5e9`;
  };

  // 선택된 카테고리로 스크롤 조정
  useEffect(() => {
    if (categoryScrollRef.current && selectedCategory) {
      // 선택된 카테고리 버튼 찾기
      const selectedButton = categoryScrollRef.current.querySelector(`button[data-category="${selectedCategory}"]`);
      
      if (selectedButton) {
        // 선택된 버튼의 위치 계산
        const containerWidth = categoryScrollRef.current.offsetWidth;
        const buttonLeft = selectedButton.offsetLeft;
        const buttonWidth = selectedButton.offsetWidth;
        
        // 버튼이 중앙에 오도록 스크롤 위치 조정
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        // 부드러운 스크롤 적용
        categoryScrollRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    } else if (categoryScrollRef.current && !selectedCategory) {
      // 전체 카테고리 선택 시 스크롤 위치 초기화
      categoryScrollRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory, categories]);

  // 카테고리 레이아웃 조정
  useEffect(() => {
    if (categoryScrollRef.current && categories.length) {
      const container = categoryScrollRef.current;
      const containerWidth = container.offsetWidth;
      
      // 모든 카테고리 버튼의 총 너비 계산 (전체 버튼 포함)
      let totalButtonsWidth = 0;
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        // 버튼의 실제 너비 + 마진/패딩 포함
        const buttonRect = button.getBoundingClientRect();
        totalButtonsWidth += buttonRect.width;
      });
      
      // 간격(gap) 추가 - 버튼 개수 - 1에 gap 크기를 곱함
      // 모바일에서는 gap-5(1.25rem = 20px), 데스크탑에서는 gap-8(2rem = 32px)
      const gapSize = window.innerWidth < 768 ? 20 : 32;
      totalButtonsWidth += (buttons.length - 1) * gapSize;
      
      // 카테고리가 적어서 컨테이너보다 작은 경우 중앙 정렬, 아니면 왼쪽 정렬
      if (totalButtonsWidth < containerWidth) {
        container.style.justifyContent = 'center';
      } else {
        container.style.justifyContent = 'flex-start';
      }
    }
  }, [categories, selectedCategory]);

  // 화면 크기 변경 시 카테고리 레이아웃 재조정
  useEffect(() => {
    const handleResize = () => {
      if (categoryScrollRef.current && categories.length) {
        const container = categoryScrollRef.current;
        const containerWidth = container.offsetWidth;
        
        // 모든 카테고리 버튼의 총 너비 계산
        let totalButtonsWidth = 0;
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
          // 버튼의 실제 너비 + 마진/패딩 포함
          const buttonRect = button.getBoundingClientRect();
          totalButtonsWidth += buttonRect.width;
        });
        
        // 간격(gap) 추가 - 버튼 개수 - 1에 gap 크기를 곱함
        // 모바일에서는 gap-5(1.25rem = 20px), 데스크탑에서는 gap-8(2rem = 32px)
        const gapSize = window.innerWidth < 768 ? 20 : 32;
        totalButtonsWidth += (buttons.length - 1) * gapSize;
        
        // 카테고리가 적어서 컨테이너보다 작은 경우 중앙 정렬, 아니면 왼쪽 정렬
        if (totalButtonsWidth < containerWidth) {
          container.style.justifyContent = 'center';
        } else {
          container.style.justifyContent = 'flex-start';
        }
        
        // 선택된 카테고리가 있으면 해당 카테고리로 스크롤
        if (selectedCategory) {
          const selectedButton = container.querySelector(`button[data-category="${selectedCategory}"]`);
          
          if (selectedButton) {
            const buttonLeft = selectedButton.offsetLeft;
            const buttonWidth = selectedButton.offsetWidth;
            
            const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
            
            container.scrollLeft = Math.max(0, scrollPosition);
          }
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    // 초기 로드 시에도 실행
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [categories, selectedCategory]);

  const handleShare = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  // 드래그 시작 핸들러
  const handleMouseDown = (e) => {
    if (!categoryScrollRef.current) return;
    
    // 클릭한 요소가 버튼인 경우 드래그를 시작하지 않음
    if (e.target.tagName.toLowerCase() === 'button' || 
        e.target.closest('button') !== null) {
      return;
    }
    
    setIsDragging(true);
    setStartX(e.pageX - categoryScrollRef.current.offsetLeft);
    setScrollLeft(categoryScrollRef.current.scrollLeft);
    
    // 텍스트 선택 방지
    e.preventDefault();
  };

  // 터치 시작 핸들러 추가
  const handleTouchStart = (e) => {
    if (!categoryScrollRef.current) return;
    
    // 터치한 요소가 버튼인 경우 드래그를 시작하지 않음
    if (e.target.tagName.toLowerCase() === 'button' || 
        e.target.closest('button') !== null) {
      return;
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - categoryScrollRef.current.offsetLeft);
    setScrollLeft(categoryScrollRef.current.scrollLeft);
  };

  // 터치 이동 핸들러 추가
  const handleTouchMove = (e) => {
    if (!isDragging || !categoryScrollRef.current) return;
    
    // 터치 이동 거리 계산
    const x = e.touches[0].pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 스크롤 속도 조절
    
    // 스크롤 위치 업데이트
    categoryScrollRef.current.scrollLeft = scrollLeft - walk;
    
    // 페이지 스크롤 방지
    e.preventDefault();
  };

  // 터치 종료 핸들러 추가
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 드래그 중 핸들러
  const handleMouseMove = (e) => {
    if (!isDragging || !categoryScrollRef.current) return;
    
    // 마우스 이동 거리 계산
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 스크롤 속도 조절 (1.5는 배수)
    
    // 스크롤 위치 업데이트
    categoryScrollRef.current.scrollLeft = scrollLeft - walk;
    
    // 텍스트 선택 방지
    e.preventDefault();
  };

  // 드래그 종료 핸들러
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 전역 마우스 이벤트 리스너 설정
  useEffect(() => {
    // 마우스 이벤트 핸들러
    const handleGlobalMouseMove = (e) => {
      if (isDragging && categoryScrollRef.current) {
        const x = e.pageX - categoryScrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        categoryScrollRef.current.scrollLeft = scrollLeft - walk;
        e.preventDefault();
      }
    };
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    // 터치 이벤트 핸들러
    const handleGlobalTouchMove = (e) => {
      if (isDragging && categoryScrollRef.current) {
        const x = e.touches[0].pageX - categoryScrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        categoryScrollRef.current.scrollLeft = scrollLeft - walk;
      }
    };
    
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };
    
    // 드래그 중일 때만 전역 이벤트 리스너 추가
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }
    
    // 컴포넌트 언마운트 또는 isDragging 변경 시 이벤트 리스너 정리
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, startX, scrollLeft]);

  // 드래그 중 커서 스타일 변경
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
    
    // 컴포넌트 언마운트 시 커서 스타일 정리
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // 스크롤바 숨기기 위한 스타일 추가
  useEffect(() => {
    // 스크롤바 숨기는 스타일 생성
    const style = document.createElement('style');
    style.textContent = `
      /* Chrome, Safari, Edge 스크롤바 숨기기 */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    `;
    document.head.appendChild(style);
    
    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 로딩 상태일 때 스켈레톤 UI 처리
  if (categoriesLoading && !categories.length) {
    // 카테고리가 로딩 중이고 카테고리 데이터가 없을 때만 카테고리 스켈레톤 표시
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        {/* 카테고리 네비게이션 스켈레톤 */}
        <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-900 sticky top-16 z-40">
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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 카테고리 영역 (네비게이션바) */}
      <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-900 sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto relative">
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto whitespace-nowrap pt-4 md:pt-10 px-4 gap-5 md:gap-6 lg:gap-8 pb-2 cursor-grab select-none hide-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchParams({}); // 전체 선택 시 query parameter 초기화
              }}
              data-category="all"
              className={`text-[14px] pb-2 px-1 transition-colors ${
                !selectedCategory
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-gray-500 dark:text-neutral-500"
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
                  data-category={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchParams({ category: category.id });
                  }}
                  className={`text-[14px] pb-2 px-1 transition-colors ${
                    selectedCategory === category.id
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-gray-500 dark:text-neutral-500"
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
      <div className="pt-[20px] md:pt-[50px] pb-8">
        <div className="max-w-[1200px] mx-auto px-4">
          {postsLoading ? (
            // 포스트 로딩 중일 때만 포스트 영역 스켈레톤 표시
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          ) : uniqueFilteredPosts.length === 0 && noPostsMessage ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-neutral-400">게시글이 없습니다.</p>
              {hasMore && !loadingMore && (
                <button 
                  onClick={loadMorePosts}
                  className="mt-4 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-md text-sm"
                >
                  더 불러오기
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {uniqueFilteredPosts.map((post) => (
                <PostCard 
                  key={`post-${post.id}`} 
                  post={post} 
                  categories={categories}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
          {/* 로딩 중이 아니고 추가 로딩 중일 때만 로딩 스피너 표시 */}
          {loadingMore && !postsLoading && (
            <div className="text-center mt-6 py-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <span className="ml-2 text-gray-500 dark:text-neutral-400">포스트 불러오는 중...</span>
            </div>
          )}
          {/* 더 이상 게시글이 없다는 메시지는 스크롤을 끝까지 내렸을 때만 표시 */}
          {!hasMore && uniqueFilteredPosts.length > 0 && !postsLoading && (
            <div className="text-center mt-6 py-4 text-gray-500 dark:text-neutral-400 text-sm">
              모든 게시글을 불러왔습니다
            </div>
          )}
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-neutral-900 text-white px-4 py-2 rounded-lg z-50">
          링크가 복사되었습니다!
        </div>
      )}
    </div>
  );
}

export default HomePage; 