import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPosts, getUserInteractions, getPost, getUserDoc, updateUserBio } from '../api/firebase';
import { updateProfile } from 'firebase/auth';
import PostCard from '../components/PostCard';
import { query, collection, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import { EditNameModal, EditBioModal } from '../components/Modal';

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [interestedPosts, setInterestedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [notifications, setNotifications] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // 로그인 상태 체크
    if (!isLoggedIn) {
      console.log('사용자가 로그인하지 않았습니다.');
      navigate('/login');
      return;
    }

    console.log('현재 로그인된 사용자:', user);

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
        const filteredPosts = await Promise.all(interactions.map(async (interaction) => {
          const post = await getPost(interaction.postId);
          return post;
        }));
        console.log('가져온 관심 포스트:', filteredPosts);
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

      // 사용자 자기소개 가져오기
      const fetchUserBio = async () => {
        try {
          const userDoc = await getUserDoc(user.uid); // getUserDoc 함수는 Firebase에서 사용자 문서를 가져오는 함수입니다
          setBio(userDoc?.bio || '');
        } catch (error) {
          console.error('자기소개 로딩 실패:', error);
        }
      };

      fetchUserBio();

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

  const handleUpdateDisplayName = async (newName) => {
    if (!newName.trim()) {
      setUpdateError('이름을 입력해주세요.');
      return;
    }

    try {
      // Firebase Authentication 업데이트
      await updateProfile(user, {
        displayName: newName
      });

      // Firestore users 컬렉션 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: newName  // schema.js에 정의된 필드명인 username으로 업데이트
      });

      setIsEditingName(false);
      setUpdateError('');
    } catch (error) {
      console.error('이름 업데이트 실패:', error);
      setUpdateError('이름 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const startEditing = () => {
    setNewDisplayName(user?.displayName || '');
    setIsEditingName(true);
    setUpdateError('');
  };

  const handleUpdateBio = async (newBio) => {
    try {
      await updateUserBio(user.uid, newBio); // updateUserBio 함수는 Firebase에 자기소개를 업데이트하는 함수입니다
      setBio(newBio);
      setIsEditingBio(false);
      setBioError('');
    } catch (error) {
      console.error('자기소개 업데이트 실패:', error);
      setBioError('자기소개 업데이트에 실패했습니다. 다시 시도해주세요.');
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
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="프로필" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-600">
                      {user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.displayName || user?.email}
                    </h2>
                    <button
                      onClick={startEditing}
                      className="text-gray-500 hover:text-gray-700"
                      title="이름 수정"
                    >
                      ✏️
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

            {/* 자기소개 섹션 */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">자기소개</h3>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-gray-500 hover:text-gray-700"
                  title="자기소개 수정"
                >
                  ✏️
                </button>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">
                {bio || '자기소개를 입력해주세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditNameModal
        isOpen={isEditingName}
        onClose={() => setIsEditingName(false)}
        onSubmit={handleUpdateDisplayName}
        initialValue={user?.displayName || ''}
        error={updateError}
      />

      <EditBioModal
        isOpen={isEditingBio}
        onClose={() => setIsEditingBio(false)}
        onSubmit={handleUpdateBio}
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