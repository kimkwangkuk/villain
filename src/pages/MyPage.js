import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getMyPosts, 
  getUserInteractions, 
  getPost, 
  getUserDoc, 
  updateUserBio,
  getCategories  // 새로 추가
} from '../api/firebase';
import PostCard from '../components/PostCard';
import { query, collection, where, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import { ProfileImageModal, EditNameModal } from '../components/Modal';
import { updateProfile } from 'firebase/auth';
import MyPageSkeleton from '../components/MyPageSkeleton';
import { PrimaryButton } from '../components/Button';

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [interestedPosts, setInterestedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [notifications, setNotifications] = useState([]);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]); // 새로 추가

  // 카테고리 데이터 로드를 위한 useEffect 추가
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 알림 클릭 시 read 상태 업데이트 함수 (실제 Firestore 알림 문서 업데이트)
  const handleNotificationClick = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log('알림 read 상태 업데이트 완료');
    } catch (error) {
      console.error('알림 read 상태 업데이트 실패:', error);
    }
  };

  useEffect(() => {
    // 로그인 상태 체크
    if (!isLoggedIn) {
      console.log('사용자가 로그인하지 않았습니다.');
      navigate('/login');
      return;
    }

    console.log('현재 로그인된 사용자:', user);
    console.log('프로필 이미지 URL:', user?.photoURL); // 디버깅용

    const fetchMyPosts = async () => {
      try {
        console.log('Fetching posts with user ID:', user?.uid);
        const filteredPosts = await getMyPosts(user?.uid);
        console.log('Fetched posts:', filteredPosts);
        setMyPosts(filteredPosts);
      } catch (error) {
        console.error('Failed to load my posts:', error);
      }
    };

    const fetchUserInteractions = async () => {
      try {
        console.log('내 관심 포스트를 가져오는 중...');
        if (!user?.uid) {
          console.error('사용자 ID가 없습니다');
          return;
        }
        
        const interactions = await getUserInteractions(user.uid);
        console.log('가져온 상호작용:', interactions);
        
        if (interactions.length === 0) {
          console.log('상호작용이 없습니다');
          setInterestedPosts([]);
          setLoading(false);
          return;
        }
        
        // 중복 제거 (같은 postId는 한 번만 처리)
        const uniquePostIds = [...new Set(interactions.map(item => item.postId))];
        console.log('중복 제거 후 게시글 ID:', uniquePostIds);
        
        // 모든 상호작용에 해당하는 포스트를 가져옵니다.
        const postsPromises = uniquePostIds.map(async (postId) => {
          try {
            return await getPost(postId);
          } catch (error) {
            console.error(`게시글 ID ${postId} 로딩 실패:`, error);
            return null;
          }
        });
        
        const postsFromInteractions = (await Promise.all(postsPromises))
          .filter(post => post !== null); // 오류나 삭제된 게시글 제외
        
        // 본인이 작성한 포스트는 제외합니다.
        const filteredPosts = postsFromInteractions.filter(post => post.authorId !== user.uid);
        console.log('필터링된 관심 포스트:', filteredPosts.length);
        
        setInterestedPosts(filteredPosts);
      } catch (error) {
        console.error('내 관심 포스트 로딩 실패:', error);
      }
    };

    // 알림 데이터 가져오기
    if (user) {
      console.log('알림 데이터 가져오기 시작...');
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        console.log('알림 스냅샷 받음:', snapshot.size, '개의 알림');
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        console.log('처리된 알림 데이터:', notificationsData);
        setNotifications(notificationsData);
      }, (error) => {
        console.error('알림 구독 에러:', error);
      });

      fetchMyPosts();
      fetchUserInteractions().then(() => {
        console.log('모든 데이터 로딩 완료');
        setLoading(false);
      });

      return () => {
        console.log('알림 구독 해제');
        unsubscribe();
      };
    }
  }, [user, isLoggedIn, navigate]);

  // loading 상태 변경 시 로그
  useEffect(() => {
    console.log('현재 로딩 상태:', loading);
  }, [loading]);

  // 프로필 이미지 업데이트 함수
  const handleProfileImageUpdate = async (newImageUrl) => {
    try {
      // Firebase Auth 프로필 업데이트
      await updateProfile(user, {
        photoURL: newImageUrl
      });

      // Firestore users 컬렉션 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: newImageUrl
      });

      // 포스트 업데이트 코드 제거: 사용자가 이미지를 변경해도 기존 포스트의 프로필 이미지는 유지됨

      setIsProfileImageModalOpen(false);
    } catch (error) {
      console.error('프로필 이미지 업데이트 실패:', error);
    }
  };

  // 이름 업데이트 함수
  const handleNameUpdate = async (newName) => {
    try {
      // Firebase Auth의 displayName 업데이트 추가
      await updateProfile(user, {
        displayName: newName
      });

      // 1. 모달 닫고 UI 즉시 업데이트
      setIsEditNameModalOpen(false);
      setNameError('');
      
      // 2. 로컬 상태 업데이트 (UI에 즉시 반영)
      if (userData) {
        setUserData({
          ...userData,
          username: newName
        });
      }

      // 3. Firestore users 컬렉션 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: newName
      });

      // 포스트와 댓글 업데이트 코드 제거: 사용자가 이름을 변경해도 기존 포스트와 댓글의 작성자 이름은 유지됨
      
      console.log('이름 업데이트 완료:', newName);
    } catch (error) {
      console.error('이름 업데이트 실패:', error);
      setNameError('이름 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 사용자 데이터 로드
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const userData = await getUserDoc(user.uid);
          console.log('로드된 사용자 데이터:', userData);
          setUserData(userData);
        } catch (error) {
          console.error('사용자 데이터 로드 실패:', error);
        }
      };
      
      loadUserData();
    }
  }, [user]);

  if (loading) {
    return <MyPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 프로필 영역 */}
      <div className="bg-white dark:bg-black py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="bg-transparent dark:bg-transparent rounded-2xl p-6 w-full max-w-md">
              <div className="flex flex-col items-center">
                {/* 프로필 이미지 */}
                <div className="relative w-24 h-24 mb-4">
                  <button
                    onClick={() => setIsProfileImageModalOpen(true)}
                    className="w-24 h-24 rounded-full overflow-hidden"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="프로필 이미지"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-2xl text-gray-600 dark:text-gray-400">
                          {user?.email?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setIsProfileImageModalOpen(true)}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-black dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-white text-sm">✎</span>
                  </button>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData?.username || user?.email}
                  </h2>
                  <button
                    onClick={() => setIsEditNameModalOpen(true)}
                    className="ml-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">이름 수정</span>
                    ✎
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center overflow-x-auto whitespace-nowrap pt-2 pb-0 px-4 gap-8">
            <button
              onClick={() => setActiveTab('myPosts')}
              className={`text-[15px] font-semibold pb-2 px-1 transition-colors text-black dark:text-white
                ${activeTab === 'myPosts' ? 'border-b-2 border-black dark:border-white' : ''}`}
            >
              내 포스트 ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('interestedPosts')}
              className={`text-[15px] font-semibold pb-2 px-1 transition-colors text-black dark:text-white
                ${activeTab === 'interestedPosts' ? 'border-b-2 border-black dark:border-white' : ''}`}
            >
              관심 포스트 ({interestedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-[15px] font-semibold pb-2 px-1 transition-colors text-black dark:text-white
                ${activeTab === 'notifications' ? 'border-b-2 border-black dark:border-white' : ''}`}
            >
              알림 ({notifications.length})
            </button>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100 dark:border-neutral-900"></div>

      {/* 포스트 영역 */}
      <div className="py-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          {activeTab === 'myPosts' ? (
            myPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">아직 작성한 게시글이 없습니다.</p>
                <Link to="/posts/new">
                  <PrimaryButton>
                    첫 게시글 작성하기
                  </PrimaryButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    categories={categories}
                  />
                ))}
              </div>
            )
          ) : activeTab === 'interestedPosts' ? (
            interestedPosts.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">아직 관심 포스트가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interestedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    categories={categories}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">새로운 알림이 없습니다.</p>
              ) : (
                notifications.map(notification => (
                  <Link
                    key={notification.id}
                    to={`/posts/${notification.postId}`}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="block bg-white dark:bg-[#0A0A0A] rounded-lg shadow dark:shadow-none p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-grow">
                        <p className="text-gray-800 dark:text-gray-200">
                          <span className="font-medium">{notification.senderName}</span>
                          {notification.type === 'comment' && '님이 회원님의 게시글에 댓글을 남겼습니다:'}
                          {notification.type === 'like' && '님이 회원님의 게시글을 좋아합니다.'}
                        </p>
                        {notification.content && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{notification.content}</p>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {dayjs(notification.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 모달 컴포넌트들 */}
      <ProfileImageModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        onSelect={handleProfileImageUpdate}
        currentImage={user?.photoURL}
      />
      <EditNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => {
          setIsEditNameModalOpen(false);
          setNameError('');
        }}
        onSubmit={handleNameUpdate}
        initialValue={userData?.username || ''}
        error={nameError}
      />
    </div>
  );
}

export default MyPage; 