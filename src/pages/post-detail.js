import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { createNotification } from '../api/firebase';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
          const postData = { id: postDoc.id, ...postDoc.data() };
          setPost(postData);
          
          // 조회 수 증가
          await updateDoc(postRef, {
            viewCount: (postData.viewCount || 0) + 1 // 조회 수 증가
          });

          // 사용자의 좋아요 상태 확인
          if (user && postData.likedBy) {
            setIsLiked(postData.likedBy.includes(user.uid));
          }
        } else {
          setError('포스트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('포스트를 불러오는데 실패했습니다:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const commentsQuery = query(
      collection(db, 'posts', id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setComments(commentsData);
      },
      (error) => {
        console.error('댓글 구독 에러:', error);
        setError(error.message);
      }
    );

    fetchPost();
    return () => unsubscribeComments();
  }, [id, user]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    // 1. 먼저 user 객체가 실제로 존재하는지 확인
    console.log('Current user:', user); // 디버깅용
    
    if (!user?.uid) {  // user가 undefined이거나 uid가 없는 경우
      alert('로그인이 필요합니다.');
      return;
    }

    if (!commentContent.trim()) return;

    try {
      await addDoc(collection(db, 'posts', id, 'comments'), {
        content: commentContent.trim(),
        userId: user.uid,
        author: user.email,
        createdAt: new Date()
      });
      
      // 게시글 작성자에게 알림 생성
      if (post.authorId !== user.uid) {  // 자신의 게시글에는 알림 생성 안 함
        await createNotification(
          'comment',
          post.id,
          post.authorId,
          user.uid,
          user.email,
          commentContent.trim()
        );
      }
      
      setCommentContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const postRef = doc(db, 'posts', id);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();
      const likedBy = postData.likedBy || [];
      const currentLikes = postData.likes || 0;

      if (isLiked) {
        // 좋아요 취소
        await updateDoc(postRef, {
          likes: currentLikes - 1,
          likedBy: likedBy.filter(uid => uid !== user.uid)
        });
        setPost(prev => ({
          ...prev,
          likes: currentLikes - 1,
          likedBy: likedBy.filter(uid => uid !== user.uid)
        }));
      } else {
        // 좋아요 추가
        await updateDoc(postRef, {
          likes: currentLikes + 1,
          likedBy: [...likedBy, user.uid]
        });
        setPost(prev => ({
          ...prev,
          likes: currentLikes + 1,
          likedBy: [...likedBy, user.uid]
        }));
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // 2초 후 토스트 메시지 숨김
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  if (loading) return <div className="text-center py-8">로딩중...</div>;
  
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  
  if (!post) return <div className="text-center py-8">포스트를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 토스트 메시지 */}
        {showToast && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black text-white px-4 py-2 rounded-lg text-[14px]">
              클립보드에 복사되었습니다
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={post.authorPhotoURL || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${post.authorId}&backgroundColor=e8f5e9`}
                  alt={`${post.authorName}의 프로필`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{post.authorName}</span>
                <span className="text-xs text-gray-400">
                  {post.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-800 mb-3">
                {post.categoryName}
              </div>
              <h1 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h1>
              <p className="text-gray-600">{post.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="text-xs text-gray-400 flex items-center">
                  <span className="mr-1">👁️</span>
                  {post.viewCount || 0}
                </span>
                <div className="flex items-center space-x-1">
                  <span>💬</span>
                  <span>{comments.length}</span>
                </div>
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{post.likes || 0}</span>
                </button>
              </div>
              
              <button 
                onClick={handleShare}
                className="text-gray-500 hover:text-gray-700"
              >
                <span>🔗</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-4 bg-white rounded-[28px] border border-gray-100">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 입력해주세요."
                  className="w-full h-[60px] resize-none border-none focus:outline-none focus:ring-0 text-gray-400 text-[16px] p-7"
                />
                <div className="px-7 pb-7 flex justify-end">
                  <button className="bg-black text-white px-6 py-3 rounded-[14px] text-[15px]">
                    등록
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
          )}

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentCard 
                  key={comment.id} 
                  comment={comment} 
                  postAuthorId={post.authorId}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail; 