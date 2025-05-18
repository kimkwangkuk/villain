'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserDoc, updateUserProfile } from '@/api/user';
import { query, collection, where, orderBy, onSnapshot, doc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import dayjs from 'dayjs';
import { ProfileImageModal, EditNameModal } from '@/components/Modal';
import { updateProfile } from 'firebase/auth';
import MyPageSkeleton from '@/components/MyPageSkeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCategories } from '@/api/categories';
import PostCard from '@/components/PostCard';
import { auth } from '@/firebase';

// 타입 정의
interface UserData {
  id: string;
  userId: string;
  username?: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: any;
  [key: string]: any;
}

// PostCard에서 사용하는 Post 인터페이스와 동일하게 맞춤
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
  reactionCount?: number;
}

interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  recipientId: string;
  senderName: string;
  postId: string;
  content?: string;
  createdAt: Date;
  read?: boolean;
  [key: string]: any;
}

// 사용자 게시물 가져오기 함수 
const getMyPosts = async (userId: string): Promise<Post[]> => {
  try {
    if (!userId) {
      console.error('사용자 ID가 없습니다');
      return [];
    }

    console.log('내 게시물 가져오기 시작:', userId);
    
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        // 기본값 제공하여 Post 인터페이스 요구사항 충족
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        authorPhotoURL: data.authorPhotoURL || undefined
      };
    }) as Post[];
    
    console.log('내 게시물 가져오기 완료:', posts.length);
    return posts;
  } catch (error) {
    console.error('내 게시물 가져오기 실패:', error);
    return [];
  }
};

// 사용자 상호작용 정보 가져오기 
const getUserInteractions = async (userId: string) => {
  try {
    if (!userId) {
      console.error('사용자 ID가 없습니다');
      return [];
    }

    console.log('사용자 상호작용 가져오기 시작:', userId);
    
    // 좋아요한 게시물
    const likedPostsQuery = query(
      collection(db, 'posts'),
      where('likedBy', 'array-contains', userId)
    );
    
    const likedPostsSnapshot = await getDocs(likedPostsQuery);
    const likedPosts = likedPostsSnapshot.docs.map(doc => ({
      postId: doc.id,
      type: 'like',
      createdAt: doc.data().updatedAt
    }));
    
    // 댓글 단 게시물
    const commentsQuery = query(
      collection(db, 'comments'),
      where('authorId', '==', userId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const commentedPosts = commentsSnapshot.docs.map(doc => ({
      postId: doc.data().postId,
      type: 'comment',
      createdAt: doc.data().createdAt
    }));
    
    // 두 배열 합치기 (중복 가능)
    const interactions = [...likedPosts, ...commentedPosts];
    console.log('사용자 상호작용 가져오기 완료:', interactions.length);
    
    return interactions;
  } catch (error) {
    console.error('사용자 상호작용 가져오기 실패:', error);
    return [];
  }
};

// 특정 게시물 가져오기
const getPost = async (postId: string): Promise<Post | null> => {
  try {
    if (!postId) {
      console.error('게시물 ID가 없습니다');
      return null;
    }

    console.log('게시물 가져오기 시작:', postId);
    
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      console.log('게시물이 존재하지 않습니다:', postId);
      return null;
    }
    
    const data = postSnapshot.data();
    const postData = { 
      id: postSnapshot.id, 
      ...data,
      createdAt: data.createdAt?.toDate(),
      // 기본값 제공하여 Post 인터페이스 요구사항 충족
      likes: data.likes || 0,
      commentCount: data.commentCount || 0,
      authorPhotoURL: data.authorPhotoURL || undefined
    } as Post;
    
    console.log('게시물 가져오기 완료:', postId);
    return postData;
  } catch (error) {
    console.error('게시물 가져오기 실패:', error, postId);
    return null;
  }
};

function MyPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, setUser } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [interestedPosts, setInterestedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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
    router.push('/');
  };

  // 알림 클릭 시 read 상태 업데이트 함수 (실제 Firestore 알림 문서 업데이트)
  const handleNotificationClick = async (notificationId: string) => {
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
      router.push('/login');
      return;
    }

    console.log('현재 로그인된 사용자:', user);
    console.log('프로필 이미지 URL:', user?.photoURL); // 디버깅용

    const fetchMyPosts = async () => {
      try {
        console.log('Fetching posts with user ID:', user?.uid);
        if (!user?.uid) return;
        
        const filteredPosts = await getMyPosts(user.uid);
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
        const uniquePostIds = [...new Set(interactions.map((item: any) => item.postId))];
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
          .filter((post): post is Post => post !== null); // 타입 가드로 null 제외
        
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

      const unsubscribeComments = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          console.log('알림 스냅샷 받음:', snapshot.size, '개의 알림');
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          })) as Notification[];
          console.log('처리된 알림 데이터:', notificationsData);
          setNotifications(notificationsData);
        },
        (error) => {
          console.error('알림 구독 에러:', error);
        }
      );

      fetchMyPosts();
      fetchUserInteractions().then(() => {
        console.log('모든 데이터 로딩 완료');
        setLoading(false);
      });

      return () => {
        console.log('알림 구독 해제');
        unsubscribeComments();
      };
    }
  }, [user, isLoggedIn, router]);

  // loading 상태 변경 시 로그
  useEffect(() => {
    console.log('현재 로딩 상태:', loading);
  }, [loading]);

  // 프로필 이미지 업데이트 함수
  const handleProfileImageUpdate = async (newImageUrl: string) => {
    try {
      if (!user) return;
      
      // Firebase Auth 프로필 업데이트
      if (user.uid) {
        // user를 any로 변환하여 임시 해결
        await updateProfile(user as any, {
          photoURL: newImageUrl
        });
  
        // Firestore users 컬렉션 업데이트
        await updateUserProfile(user.uid, {
          photoURL: newImageUrl
        });
  
        // 포스트 업데이트 코드 제거: 사용자가 이미지를 변경해도 기존 포스트의 프로필 이미지는 유지됨
  
        setIsProfileImageModalOpen(false);
      }
    } catch (error) {
      console.error('프로필 이미지 업데이트 실패:', error);
    }
  };

  // 이름 업데이트 함수
  const handleNameUpdate = async (newName: string) => {
    try {
      if (!user || !user.uid) {
        setNameError('로그인 정보를 확인할 수 없습니다.');
        return;
      }

      if (!newName || newName.trim() === '') {
        setNameError('이름을 입력해주세요.');
        return;
      }
      
      console.log('이름 업데이트 시작:', newName);
      
      // 1. Firebase Auth의 displayName 업데이트
      try {
        // 재시도 로직 추가
        const updateProfileWithRetry = async (maxRetries = 5) => {
          let lastError = null;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`이름 업데이트 시도 ${attempt}/${maxRetries}`);
              
              // 현재 사용자 직접 참조하여 토큰 새로 고침
              let currentUser = auth.currentUser;
              if (!currentUser) {
                console.error('현재 인증된 사용자를 찾을 수 없습니다');
                throw new Error('현재 인증된 사용자를 찾을 수 없습니다');
              }
              
              // 기존 프로필 데이터 저장
              const existingDisplayName = currentUser.displayName;
              const existingPhotoURL = currentUser.photoURL;
              
              console.log('업데이트 전 정보:', {
                displayName: existingDisplayName,
                photoURL: existingPhotoURL
              });
              
              // 프로필 업데이트: 기존 프로필 사진은 유지하면서 이름만 변경
              await updateProfile(currentUser, {
                displayName: newName,
                photoURL: existingPhotoURL // 기존 프로필 이미지 유지
              });
              
              console.log(`Firebase Auth displayName 업데이트 성공 (시도 ${attempt}/${maxRetries})`);
              
              // 업데이트 후 사용자 정보 다시 가져오기 (변경 확인)
              await auth.currentUser?.reload();
              currentUser = auth.currentUser;
              console.log('업데이트 후 정보:', {
                displayName: currentUser?.displayName,
                photoURL: currentUser?.photoURL
              });
              
              // 성공적으로 업데이트되면 재시도 중단
              return;
            } catch (error) {
              lastError = error;
              console.error(`이름 업데이트 실패 (시도 ${attempt}/${maxRetries}):`, error);
              
              // 네트워크 오류인 경우에만 재시도
              const isNetworkError = 
                error instanceof Error && 
                ((error as any).code === 'auth/network-request-failed' || 
                 error.message.includes('network'));
                
              if (isNetworkError && attempt < maxRetries) {
                console.log(`네트워크 오류 발생, ${attempt}/${maxRetries} 재시도 중...`);
                // 지수 백오프로 재시도 간격 증가 (200, 400, 800, 1600ms...)
                const delay = 200 * Math.pow(2, attempt - 1); 
                console.log(`${delay}ms 후 재시도합니다.`);
                await new Promise(resolve => setTimeout(resolve, delay));
              } else {
                // 네트워크 오류가 아니거나 모든 재시도 실패 시 오류 전파
                throw error;
              }
            }
          }
          
          // 모든 재시도가 실패한 경우
          throw lastError;
        };
        
        // 재시도 로직 적용
        await updateProfileWithRetry();
      } catch (authError) {
        console.error('Firebase Auth 프로필 업데이트 실패:', authError);
        
        // 오류 세부 정보 확인
        if (authError instanceof Error) {
          const errorMessage = authError.message;
          const errorCode = (authError as any).code;
          console.error('오류 코드:', errorCode);
          console.error('오류 메시지:', errorMessage);
          
          if (errorCode === 'auth/network-request-failed') {
            setNameError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
          } else if (errorCode === 'auth/requires-recent-login') {
            setNameError('보안을 위해 재로그인이 필요합니다.');
            // 필요시 로그아웃 처리 또는 재인증 요청
          } else {
            setNameError(`인증 프로필 업데이트에 실패했습니다: ${errorMessage}`);
          }
        } else {
          setNameError('인증 프로필 업데이트에 실패했습니다.');
        }
        throw authError;
      }

      // 2. 모달 닫고 UI 즉시 업데이트 (낙관적 업데이트)
      setIsEditNameModalOpen(false);
      setNameError('');
      
      // 3. 로컬 상태 업데이트 (UI에 즉시 반영)
      if (userData) {
        setUserData({
          ...userData,
          username: newName
        });
      }
      
      // 4. AuthContext의 user 상태 업데이트
      if (user && setUser) {
        // AuthContext의 사용자 상태 업데이트
        setUser({
          ...user,
          displayName: newName
        });
        console.log('AuthContext 사용자 상태 업데이트 완료');
      }

      // 5. Firestore users 컬렉션 업데이트
      const result = await updateUserProfile(user.uid, {
        username: newName
      });

      if (!result.success) {
        console.error('Firestore 사용자 프로필 업데이트 실패:', result.error);
        // UI는 이미 업데이트했으므로 조용히 오류 기록
      }
      
      console.log('이름 업데이트 완료:', newName);
    } catch (error) {
      console.error('이름 업데이트 중 오류 발생:', error);
      setNameError('이름 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 사용자 데이터 로드
  useEffect(() => {
    if (user && user.uid) {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* 프로필 영역 */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <Card className="bg-card shadow-sm w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {/* 프로필 이미지 */}
                  <div className="relative w-24 h-24 mb-4">
                    <button
                      onClick={() => setIsProfileImageModalOpen(true)}
                      className="w-24 h-24 rounded-full overflow-hidden"
                    >
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={user?.photoURL ?? undefined}
                          alt="프로필 이미지"
                        />
                        <AvatarFallback className="text-2xl bg-muted">
                          {user?.email?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <button
                      onClick={() => setIsProfileImageModalOpen(true)}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <span className="text-primary-foreground text-sm">✎</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {userData?.username || user?.email}
                    </h2>
                    <button
                      onClick={() => setIsEditNameModalOpen(true)}
                      className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="sr-only">이름 수정</span>
                      ✎
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="max-w-7xl mx-auto px-4">
        <Tabs defaultValue="myPosts" onValueChange={setActiveTab} value={activeTab} className="w-full">
          <TabsList className="inline-flex">
            <TabsTrigger 
              value="myPosts"
              className="font-semibold whitespace-nowrap px-4"
            >
              내 포스트 ({myPosts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="interestedPosts" 
              className="font-semibold whitespace-nowrap px-4"
            >
              관심 포스트 ({interestedPosts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="font-semibold whitespace-nowrap px-4"
            >
              알림 ({notifications.length})
            </TabsTrigger>
          </TabsList>

          <div className="border-t border-border mt-2 dark:hidden"></div>

          {/* 포스트 영역 */}
          <div className="py-6">
            <TabsContent value="myPosts">
              <Card>
                <CardContent className="pt-6">
                  {myPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">아직 작성한 게시글이 없습니다.</p>
                      <Link href="/add-post">
                        <Button>
                          첫 게시글 작성하기
                        </Button>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interestedPosts">
              <Card>
                <CardContent className="pt-6">
                  {interestedPosts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">아직 관심 포스트가 없습니다.</p>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">새로운 알림이 없습니다.</p>
                    ) : (
                      notifications.map(notification => (
                        <Link
                          key={notification.id}
                          href={`/postdetail/${notification.postId}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-grow">
                                  <p className="text-foreground">
                                    <span className="font-medium">{notification.senderName}</span>
                                    {notification.type === 'comment' && '님이 회원님의 게시글에 댓글을 남겼습니다:'}
                                    {notification.type === 'like' && '님이 회원님의 게시글을 좋아합니다.'}
                                  </p>
                                  {notification.content && (
                                    <p className="text-muted-foreground mt-1">{notification.content}</p>
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {dayjs(notification.createdAt).fromNow()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* 모달 컴포넌트들 */}
      <ProfileImageModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        onSelect={handleProfileImageUpdate}
        currentImage={user?.photoURL ?? undefined}
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