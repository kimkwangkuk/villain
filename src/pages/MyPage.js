import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPosts, getUserInteractions, getPost, getUserDoc, updateUserBio } from '../api/firebase';
import PostCard from '../components/PostCard';
import { query, collection, where, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import { ProfileImageModal, EditNameModal, EditBioModal } from '../components/Modal';
import { updateProfile } from 'firebase/auth';

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
  const [bio, setBio] = useState('');
  const [isEditBioModalOpen, setIsEditBioModalOpen] = useState(false);
  const [bioError, setBioError] = useState('');
  const [userData, setUserData] = useState(null);

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
        console.log('내 게시글을 가져오는 중...');
        const filteredPosts = await getMyPosts(user?.uid);
        console.log('가져온 게시글:', filteredPosts);
        setMyPosts(filteredPosts);
      } catch (error) {
        console.error('내 게시글 로딩 실패:', error);
      }
    };

    const fetchUserInteractions = async () => {
      try {
        console.log('내 관심 포스트를 가져오는 중...');
        const interactions = await getUserInteractions(user?.uid);
        console.log('가져온 상호작용:', interactions);
        
        // 모든 상호작용에 해당하는 포스트를 가져옵니다.
        const postsFromInteractions = await Promise.all(
          interactions.map(async (interaction) => {
            const post = await getPost(interaction.postId);
            return post;
          })
        );
        
        // 같은 포스트가 여러 번 들어올 경우 중복을 제거합니다.
        const dedupedPosts = Array.from(new Map(
          postsFromInteractions.map(post => [post.id, post])
        ).values());
        
        console.log('가져온 관심 포스트 (중복 제거됨):', dedupedPosts);
        setInterestedPosts(dedupedPosts);
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

      // 사용자가 작성한 모든 포스트의 authorPhotoURL 업데이트
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      const updatePromises = postsSnapshot.docs.map(postDoc => 
        updateDoc(doc(db, 'posts', postDoc.id), {
          authorPhotoURL: newImageUrl
        })
      );
      await Promise.all(updatePromises);

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
      setUserData(prev => ({
        ...prev,
        username: newName
      }));
      
      setMyPosts(prev => prev.map(post => ({
        ...post,
        authorName: newName
      })));

      // 3. Firestore users 컬렉션 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: newName
      });

      // 4. 백그라운드에서 posts 업데이트
      const updatePosts = async () => {
        try {
          const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', user.uid)
          );
          const postsSnapshot = await getDocs(postsQuery);
          
          const updatePromises = postsSnapshot.docs.map(postDoc => 
            updateDoc(doc(db, 'posts', postDoc.id), {
              authorName: newName
            })
          );
          await Promise.all(updatePromises);
          console.log('모든 포스트 업데이트 완료');
        } catch (error) {
          console.error('포스트 업데이트 중 오류:', error);
          // 에러 발생시 사용자에게 알림 (선택사항)
          // toast.error('일부 데이터 업데이트에 실패했습니다');
        }
      };

      // 백그라운드에서 포스트 업데이트 실행
      updatePosts();

    } catch (error) {
      console.error('이름 업데이트 실패:', error);
      setNameError('이름 업데이트에 실패했습니다.');
      
      // 에러 발생 시 UI 롤백
      setUserData(prev => ({
        ...prev,
        username: prev.username
      }));
    }
  };

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userData = await getUserDoc(user.uid);
          setUserData(userData);
          setBio(userData.bio || '');
        } catch (error) {
          console.error('사용자 정보 로딩 실패:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  // 자기소개 업데이트 함수
  const handleBioUpdate = async (newBio) => {
    try {
      await updateUserBio(user.uid, newBio);
      setBio(newBio);
      setIsEditBioModalOpen(false);
      setBioError('');
    } catch (error) {
      console.error('자기소개 업데이트 실패:', error);
      setBioError('자기소개 업데이트에 실패했습니다.');
    }
  };

  if (!isLoggedIn) return null;
  if (loading) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsProfileImageModalOpen(true)}
                  className="relative w-20 h-20 rounded-full overflow-hidden group"
                >
                  {user?.photoURL ? (
                    <>
                      <img 
                        src={user.photoURL} 
                        alt="프로필" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-sm">변경</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-600">
                        {user?.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userData?.username || user?.email}
                    </h2>
                    <button
                      onClick={() => setIsEditNameModalOpen(true)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      <span className="sr-only">이름 수정</span>
                      ✎
                    </button>
                  </div>
                  <p className="text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                로그아웃
              </button>
            </div>

            {/* 자기소개 섹션 추가 */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">자기소개</h3>
                <button
                  onClick={() => setIsEditBioModalOpen(true)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">자기소개 수정</span>
                  ✎
                </button>
              </div>
              <p className="text-gray-600">
                {bio || '자기소개가 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 이미지 선택 모달 */}
      <ProfileImageModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        onSelect={handleProfileImageUpdate}
        currentImage={user?.photoURL}
      />

      {/* 이름 수정 모달 추가 */}
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

      {/* 자기소개 수정 모달 */}
      <EditBioModal
        isOpen={isEditBioModalOpen}
        onClose={() => {
          setIsEditBioModalOpen(false);
          setBioError('');
        }}
        onSubmit={handleBioUpdate}
        initialValue={bio}
        error={bioError}
      />

      <div className="bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto whitespace-nowrap py-4 px-4 gap-8">
            <button
              onClick={() => setActiveTab('myPosts')}
              className={`text-[17px] font-semibold pb-2 px-1 transition-colors text-black
                ${activeTab === 'myPosts' ? 'border-b-2 border-black' : ''}`}
            >
              내 포스트 ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('interestedPosts')}
              className={`text-[17px] font-semibold pb-2 px-1 transition-colors text-black
                ${activeTab === 'interestedPosts' ? 'border-b-2 border-black' : ''}`}
            >
              관심 포스트 ({interestedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-[17px] font-semibold pb-2 px-1 transition-colors text-black
                ${activeTab === 'notifications' ? 'border-b-2 border-black' : ''}`}
            >
              알림 ({notifications.length})
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {activeTab === 'myPosts' ? (
            myPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">아직 작성한 게시글이 없습니다.</p>
                <Link 
                  to="/posts/new" 
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  첫 게시글 작성하기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : activeTab === 'interestedPosts' ? (
            interestedPosts.length === 0 ? (
              <p className="text-center py-8 text-gray-500">아직 관심 포스트가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interestedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-gray-500">새로운 알림이 없습니다.</p>
              ) : (
                notifications.map(notification => (
                  <Link
                    key={notification.id}
                    to={`/posts/${notification.postId}`}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-grow">
                        <p className="text-gray-800">
                          <span className="font-medium">{notification.senderName}</span>
                          {notification.type === 'comment' && '님이 회원님의 게시글에 댓글을 남겼습니다:'}
                          {notification.type === 'like' && '님이 회원님의 게시글을 좋아합니다.'}
                        </p>
                        {notification.content && (
                          <p className="text-gray-600 mt-1">{notification.content}</p>
                        )}
                        <span className="text-sm text-gray-500">
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
    </div>
  );
}

export default MyPage; 