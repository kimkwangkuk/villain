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
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 컴포넌트 마운트 시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    // 단순화된 쿼리
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

    // 현재 댓글 내용 저장
    const currentComment = commentContent;
    
    // 입력창 즉시 초기화
    setCommentContent('');

    // 낙관적 업데이트: 현재 댓글 수를 즉시 1 증가
    const previousCommentCount = post?.commentCount || 0;
    setPost((prev) => ({
      ...prev,
      commentCount: previousCommentCount + 1
    }));

    try {
      await addComment(id, currentComment);
    } catch (error) {
      // 에러 시 롤백 처리
      setPost((prev) => ({
        ...prev,
        commentCount: previousCommentCount
      }));
      // 에러 시 입력창 복구
      setCommentContent(currentComment);
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 처리 중이면 중복 요청 방지
    if (isLikeLoading) return;
    
    // 낙관적 업데이트: 현재 상태 바로 변경
    const previousIsLiked = isLiked;
    const previousLikes = post.likes;
    setIsLiked(!previousIsLiked);
    setPost(prev => ({ 
      ...prev, 
      likes: previousIsLiked ? previousLikes - 1 : previousLikes + 1 
    }));
    
    try {
      setIsLikeLoading(true);
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
    } finally {
      setIsLikeLoading(false);
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
    <div className="bg-white py-8">
      {/* 프로필과 콘텐츠를 감싸는 컨테이너 */}
      <div className="w-full px-4">
        <div className="max-w-[580px] mx-auto bg-gray-100 rounded-2xl">
          {/* 프로필 영역 */}
          <div className="pb-[0px] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={
                      post.authorPhotoURL ||
                      `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${post.authorId}&backgroundColor=e8f5e9`
                    }
                    alt={`${post.authorName}의 프로필`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2">
                  <div className="text-[13px] font-semibold text-gray-900">
                    {post.authorName}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    <span>{post.categoryName}</span>
                    <span className="mx-1">·</span>
                    <span>{post.createdAt?.toDate().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              {/* 더보기 버튼 */}
              <button className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200">
                <span className="text-gray-300 text-sm transition-colors hover:text-gray-900">⋮</span>
              </button>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="pt-[0px] p-4">
            <div className="pt-3 pb-6">
              <h1 className="text-[20px] font-semibold text-gray-900 mb-2">{post.title}</h1>
              <p className="text-[16px] text-gray-900 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* 좋아요/댓글 수 표시 */}
            <div className="flex items-center justify-between text-[14px] text-gray-500 pb-3">
              <span>{post.likes || 0}명의 반응</span>
              <span>댓글 {post.commentCount || 0}</span>
            </div>

            {/* 좋아요/댓글/공유 버튼 컨테이너 */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 -mx-4 px-4">
              {/* 좋아요 버튼 */}
              <button 
                onClick={handleLike}
                disabled={isLikeLoading}
                className="flex items-center hover:bg-gray-200 group transition-colors duration-200 rounded-full px-2 py-1"
              >
                <LikeIcon className={`w-[22px] h-[22px] ${isLiked ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-800'}`} />
                <span className={`ml-[2px] ${isLiked ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-800'} text-[14px] relative top-[1px]`}>
                  {isLiked ? "반응 취소" : "반응"}
                </span>
              </button>

              {/* 댓글 버튼 */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    alert('로그인이 필요합니다.');
                    return;
                  }
                  const commentInput = document.querySelector('textarea');
                  if (commentInput) {
                    commentInput.focus();
                  }
                }}
                className="flex items-center hover:bg-gray-200 group transition-colors duration-200 rounded-full px-2 py-1"
              >
                <MessageIcon className="w-[22px] h-[22px] text-gray-600 group-hover:text-gray-800" />
                <span className="ml-[2px] text-gray-600 group-hover:text-gray-800 text-[14px] relative top-[1px]">댓글</span>
              </button>

              {/* 공유 버튼 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare();
                }}
                className="flex items-center hover:bg-gray-200 group transition-colors duration-200 rounded-full px-2 py-1"
              >
                <ShareIcon className="w-[22px] h-[22px] text-gray-600 group-hover:text-gray-800" />
                <span className="ml-[2px] text-gray-600 group-hover:text-gray-800 text-[14px] relative top-[1px]">공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 영역 전체를 감싸는 컨테이너 */}
      <div className="w-full px-4 mt-4">
        <div className="max-w-[580px] mx-auto">
          {/* 댓글 입력 영역 */}
          <div className="bg-gray-100 rounded-2xl">
            <form onSubmit={handleCommentSubmit}>
              <div className="bg-gray-100 rounded-2xl p-[12px] w-full">
                <div className="flex items-center space-x-2">
                  <div className="w-[30px] h-[30px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {isLoggedIn ? (
                      <img
                        src={user?.photoURL || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user?.uid}&backgroundColor=e8f5e9`}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">?</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 w-full">
                      {isLoggedIn ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/login"
                            state={{ from: `/posts/${id}` }}
                            className="flex-1"
                          >
                            <div className="text-[15px] text-gray-400">
                              댓글을 작성하려면 로그인이 필요합니다.
                            </div>
                          </Link>
                          <div className="flex-shrink-0">
                            <Link 
                              to="/login"
                              state={{ from: `/posts/${id}` }}
                            >
                              <PrimaryButton>
                                로그인
                              </PrimaryButton>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* 댓글 리스트 영역 */}
          {comments.length > 0 && (
            <div className="mt-4 bg-gray-100 rounded-2xl">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <CommentCard
                    comment={{
                      ...comment,
                      authorPhotoURL: comment.photoURL,
                      userId: comment.userId,
                    }}
                    postAuthorId={post.authorId}
                    onEdit={(newContent) => handleEditComment(comment.id, newContent)}
                    onDelete={() => handleDeleteComment(comment.id)}
                  />
                  {index !== comments.length - 1 && (
                    <div className="h-[1px] bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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