import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { addComment, updateComment, deleteComment, updateLikes } from '../api/firebase';
import { MessageIcon, LikeIcon, ShareIcon } from '../components/Icons';
import { PrimaryButton } from '../components/Button';
import { EllipsisIcon } from '../components/Icons';
import PostDetailSkeleton from '../components/PostDetailSkeleton';

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
            viewCount: (postData.viewCount || 0) + 1
          });

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
      collection(db, 'comments'),
      where('postId', '==', id),
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
    if (!user?.uid) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentContent.trim()) return;

    // 낙관적 업데이트: 현재 댓글 수를 즉시 1 증가
    const previousCommentCount = post?.commentCount || 0;
    setPost((prev) => ({
      ...prev,
      commentCount: previousCommentCount + 1
    }));

    try {
      await addComment(id, commentContent);
      setCommentContent('');
    } catch (error) {
      // 에러 시 롤백 처리
      setPost((prev) => ({
        ...prev,
        commentCount: previousCommentCount
      }));
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 낙관적 업데이트: 현재 상태 바로 변경
    const previousIsLiked = isLiked;
    const previousLikes = post.likes;
    setIsLiked(!previousIsLiked);
    setPost(prev => ({ ...prev, likes: previousIsLiked ? previousLikes - 1 : previousLikes + 1 }));
    
    try {
      const updatedPost = await updateLikes(post.id, user.uid, user.displayName || '익명');
      setPost(prev => ({
        ...prev,
        likes: updatedPost.likes,
        likedBy: updatedPost.likedBy
      }));
    } catch (error) {
      // 요청 실패 시 롤백
      setIsLiked(previousIsLiked);
      setPost(prev => ({ ...prev, likes: previousLikes }));
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

  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim()) return;
    
    try {
      await updateComment(commentId, newContent);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    // 낙관적 업데이트: 삭제 직후 local state에서 commentCount를 1 감소
    setPost(prev => ({
      ...prev,
      commentCount: (prev.commentCount || 0) - 1
    }));

    try {
      await deleteComment(id, commentId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
      // 삭제 실패 시 롤백: commentCount 복구
      setPost(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
    }
  };

  if (loading) return <PostDetailSkeleton />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-8">포스트를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white py-8">
      {/* 프로필 영역 */}
      <div className="w-full px-4">
        <div className="max-w-[560px] mx-auto">
          <div className="bg-white rounded-3xl pb-[16px]">
            <div className="flex items-center justify-between">
              {/* 프로필 정보 영역 */}
              <div className="flex items-center space-x-2">
                <div className="w-[36px] h-[36px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      post.authorPhotoURL ||
                      `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${post.authorId}&backgroundColor=e8f5e9`
                    }
                    alt={`${post.authorName}의 프로필`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-gray-900">
                    {post.authorName}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[13px] text-gray-900">
                      #{post.categoryName}
                    </span>
                    <span className="text-[13px] text-gray-900">
                      에 쓴 글
                    </span>
                    <span className="text-[13px] text-gray-400">
                      {post.createdAt?.toDate().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              {/* 더보기 버튼 */}
              <button className="hover:bg-gray-100 rounded-full p-1 cursor-pointer transition-colors duration-200">
                <EllipsisIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full">
        <div className="h-[1px] bg-gray-100" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="w-full bg-gray-50 px-4 py-4">
        <div className="max-w-[560px] mx-auto">
          <div className="pt-4 pb-6">
            <h1 className="text-[22px] font-semibold text-gray-900 mb-2">{post.title}</h1>
            <p className="text-[16px] text-gray-900">{post.content}</p>
          </div>
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="w-full bg-gray-50 px-4 pb-5">
        <div className="max-w-[560px] mx-auto">
          <div className="rounded-3xl bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 font-medium text-[14px] text-gray-900">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-1"
                >
                  <LikeIcon 
                    className={`w-[24px] h-[24px] ${isLiked ? 'text-red-500' : 'text-gray-900 hover:text-red-500'}`} 
                  />
                  <span>{post.likes || 0}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <MessageIcon className="w-[24px] h-[24px] text-gray-900" />
                  <span>{post.commentCount || 0}</span>
                </div>
                <span className="flex items-center">
                  <span className="mr-1">
                    <MessageIcon className="w-[24px] h-[24px] text-gray-500" />
                  </span>
                  {post.viewCount || 0}
                </span>
              </div>
              <button 
                onClick={handleShare}
                className="text-gray-500 hover:text-gray-700"
              >
                <ShareIcon className="w-[24px] h-[24px] text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 입력 영역 */}
      <div className="max-w-[560px] rounded-[20px] mx-auto mt-4 bg-gray-50">
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="bg-gray-50 rounded-2xl p-[12px] w-full">
              <div className="flex items-center space-x-2">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={user?.photoURL || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user?.uid}&backgroundColor=e8f5e9`}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 w-full">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="댓글을 달아주세요."
                      rows="1"
                      className="flex-1 bg-transparent resize-none border-none focus:outline-none focus:ring-0 text-[15px] placeholder-gray-400 overflow-hidden"
                      style={{
                        minHeight: '24px',
                        height: 'auto'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <div className="flex-shrink-0">
                      <PrimaryButton type="submit">
                        올리기
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="px-6 mb-4 flex items-center justify-between">
            <p className="text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Link 
              to="/login"
              state={{ from: `/posts/${id}` }}
              className="bg-black text-white px-4 py-2 rounded-xl text-[14px] hover:bg-gray-800"
            >
              로그인
            </Link>
          </div>
        )}
      </div>

      {/* 댓글 리스트 영역 */}
      <div className="max-w-[560px] mx-auto mt-4 bg-gray-50 rounded-2xl">
        {comments.length > 0 && (
          <div>
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <CommentCard
                  comment={{
                    ...comment,
                    authorName: comment.author,
                    authorPhotoURL: comment.photoURL,
                    userId: comment.userId,
                  }}
                  postAuthorId={post.authorId}
                  onEdit={(newContent) => handleEditComment(comment.id, newContent)}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
                {index !== comments.length - 1 && (
                  <div className="h-[1px] bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg">
          링크가 복사되었습니다!
        </div>
      )}
    </div>
  );
}

export default PostDetail; 