import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { addComment, updateComment, deleteComment, updateLikes, updatePost, deletePost, updateReaction, getPostReactions } from '../api/firebase';
import { MessageIcon, LikeIcon, ShareIcon } from '../components/Icons';
import { PrimaryButton } from '../components/Button';
import { EllipsisIcon } from '../components/Icons';
import PostDetailSkeleton from '../components/PostDetailSkeleton';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { detectUrls } from '../utils/urlUtils';
import { reactions } from '../data/reactions';

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const popupRef = useRef(null);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionEmojis, setReactionEmojis] = useState([]);

  // 외부 클릭 감지를 위한 useEffect 추가
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 버튼 클릭 시 이벤트 처리 방지
      if (event.target.closest('button')) {
        return;
      }
      
      // 더보기 메뉴 외부 클릭 감지
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
      
      // 반응 팝업 외부 클릭 감지
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReactionPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 반응 데이터 로드
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const reactions = await getPostReactions(id);
        if (user && reactions[user.uid]) {
          setUserReaction(reactions[user.uid]);
        }
        
        // 반응 이모지 처리
        const emojiCounts = {};
        Object.values(reactions).forEach(reaction => {
          if (reaction && reaction.emoji) {
            if (!emojiCounts[reaction.emoji]) {
              emojiCounts[reaction.emoji] = 0;
            }
            emojiCounts[reaction.emoji]++;
          }
        });
        
        // 이모지를 개수 기준으로 정렬하고 최대 3개만 선택
        const sortedEmojis = Object.keys(emojiCounts)
          .sort((a, b) => emojiCounts[b] - emojiCounts[a])
          .slice(0, 3);
          
        setReactionEmojis(sortedEmojis);
      } catch (error) {
        console.error('반응 데이터 로드 실패:', error);
      }
    };

    loadReactions();
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
    
    // 텍스트 영역 높이 초기화
    const textarea = e.target.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = '24px'; // 기본 높이로 재설정
    }

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
    try {
      await deleteComment(id, commentId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleReport = () => {
    alert('신고가 접수되었습니다.');
    setShowMoreMenu(false);
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(id);
      navigate('/'); // 삭제 후 메인 페이지로 이동
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // getRelativeTime 함수 추가
  const getRelativeTime = (date) => {
    return dayjs(date).fromNow();
  };

  // 반응 클릭 핸들러
  const handleReactionClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 팝업이 열린 상태에서 버튼을 누르면 팝업만 닫기
    if (showReactionPopup) {
      setShowReactionPopup(false);
      return;
    }

    // 이미 반응한 상태에서 버튼을 누르면 반응 취소
    if (userReaction) {
      try {
        // 낙관적 업데이트
        setUserReaction(null);

        // Firebase 업데이트
        const result = await updateReaction(id, user.uid, null);
        setPost(prev => ({ ...prev, reactionCount: result.reactionCount }));
      } catch (error) {
        console.error('반응 취소 실패:', error);
        alert('반응 취소에 실패했습니다.');
      }
      return;
    }

    // 반응하지 않은 상태에서는 팝업 표시
    setShowReactionPopup(true);
  };

  // 반응 선택 핸들러
  const handleReactionSelect = async (reaction) => {
    try {
      // 이미 선택한 반응을 다시 선택한 경우 취소
      if (userReaction?.id === reaction.id) {
        // 낙관적 업데이트
        setUserReaction(null);
        setShowReactionPopup(false);

        // Firebase 업데이트
        const result = await updateReaction(id, user.uid, null);
        setPost(prev => ({ ...prev, reactionCount: result.reactionCount }));
        return;
      }

      // 새로운 반응 선택
      // 낙관적 업데이트
      const previousReaction = userReaction;
      setUserReaction(reaction);
      setShowReactionPopup(false);

      // Firebase 업데이트
      const result = await updateReaction(id, user.uid, reaction);
      setPost(prev => ({ ...prev, reactionCount: result.reactionCount }));

      // 실패 시 롤백
      if (!result) {
        setUserReaction(previousReaction);
        throw new Error('반응 업데이트 실패');
      }
    } catch (error) {
      console.error('반응 처리 실패:', error);
      alert('반응 처리에 실패했습니다.');
    }
  };

  // 카테고리 클릭 핸들러 추가
  const handleCategoryClick = (e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/?category=${categoryId}`);
  };

  if (loading) return <PostDetailSkeleton />;
  if (error) return <div className="text-center py-8 text-red-500 dark:text-red-400">{error}</div>;
  if (!post) return <div className="text-center py-8 text-gray-700 dark:text-neutral-300">포스트를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-8">
      {/* 프로필과 콘텐츠를 감싸는 컨테이너 */}
      <div className="w-full px-4">
        <div className="max-w-[590px] mx-auto bg-gray-100 dark:bg-[#121212] rounded-2xl">
          {/* 프로필 영역 */}
          <div className="pb-[0px] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={
                      post?.authorPhotoURL ||
                      `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${post?.authorId}&backgroundColor=e8f5e9`
                    }
                    alt={`${post?.authorName}의 프로필`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2">
                  <div className="text-[13px] font-semibold text-gray-900 dark:text-neutral-300">
                    {post?.authorName}
                  </div>
                  <div className="text-[12px] text-gray-500 dark:text-neutral-500">
                    {/* 카테고리를 클릭 가능한 링크로 변경 */}
                    <button 
                      onClick={(e) => handleCategoryClick(e, post?.categoryId)}
                      className="hover:underline hover:text-gray-700 dark:hover:text-neutral-400 transition-colors"
                    >
                      {post?.categoryName}
                    </button>
                    <span className="mx-1">·</span>
                    <span>{getRelativeTime(post?.createdAt?.toDate())}</span>
                  </div>
                </div>
              </div>
              {/* 더보기 버튼과 팝업 메뉴 */}
              <div className="relative" ref={moreMenuRef}>
                <button 
                  className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-neutral-800"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <span className="text-gray-300 dark:text-neutral-500 text-sm transition-colors hover:text-gray-900 dark:hover:text-neutral-300">⋮</span>
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-900 rounded-lg shadow-lg dark:shadow-black z-10 py-1">
                    {user?.uid === post?.authorId && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/posts/new', { 
                              state: { 
                                isEditing: true,
                                post: {
                                  id: post.id,
                                  title: post.title,
                                  content: post.content,
                                  categoryId: post.categoryId
                                }
                              }
                            });
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n관련된 모든 댓글도 함께 삭제됩니다.')) {
                              handleDeletePost();
                            }
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                          삭제하기
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleReport}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                      신고하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="pt-[0px] p-4 pb-0">
            <div className="pt-3 pb-6">
              <h1 className="text-[20px] font-semibold text-gray-900 dark:text-neutral-300 mb-2">{post?.title}</h1>
              <p className="text-[16px] text-gray-700 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {detectUrls(post?.content).map((part) => (
                  part.type === 'url' ? (
                    <a
                      key={part.key}
                      href={part.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-400 hover:underline break-all"
                    >
                      {part.content}
                    </a>
                  ) : (
                    <span key={part.key}>{part.content}</span>
                  )
                ))}
              </p>
              {/* URL 미리보기 */}
              {detectUrls(post?.content).some(part => part.type === 'url') && (
                <div className="mt-4 text-sm text-gray-500 dark:text-neutral-500 space-y-1">
                  {detectUrls(post?.content).map((part) => {
                    if (part.type === 'url') {
                      // URL을 파싱하여 도메인만 추출 (슬래시 없이)
                      let displayUrl = part.content;
                      try {
                        const url = new URL(part.content);
                        displayUrl = url.hostname;
                      } catch (e) {
                        // URL 파싱 실패 시 원래 URL 사용
                        console.error("URL 파싱 실패:", e);
                      }
                      
                      return (
                        <a
                          key={part.key}
                          href={part.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:underline w-full"
                        >
                          <span className="flex-shrink-0">🔗</span>
                          <span className="truncate flex-1">{displayUrl}</span>
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* 좋아요/댓글 수 표시 */}
            <div className="flex items-center justify-between text-[14px] text-gray-500 dark:text-neutral-500 pb-3">
              <div className="flex items-center">
                {/* 반응 이모지 표시 */}
                {reactionEmojis.length > 0 ? (
                  <>
                    <div className="flex -space-x-1 mr-1">
                      {reactionEmojis.map((emoji, index) => (
                        <div 
                          key={index} 
                          className="w-5 h-5 flex items-center justify-center bg-white dark:bg-neutral-800 rounded-full text-sm border border-gray-200 dark:border-neutral-700 shadow-sm"
                          style={{ zIndex: 3 - index, marginLeft: index > 0 ? '-8px' : '0' }}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span>{post.reactionCount || 0}명의 반응</span>
                  </>
                ) : (
                  <span>{post.reactionCount || 0}명의 반응</span>
                )}
              </div>
              <span>댓글 {post.commentCount || 0}</span>
            </div>

            {/* 좋아요/댓글/공유 버튼 컨테이너 */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-900 py-2 -mx-4 px-4">
              {/* 반응 버튼 */}
              <div className="relative flex-1 max-w-[33%]">
                <button 
                  onClick={handleReactionClick}
                  className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-3 py-2"
                >
                  {userReaction ? (
                    <span className="text-[18px] w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">{userReaction.emoji}</span>
                  ) : (
                    <LikeIcon className="w-[22px] h-[22px] flex-shrink-0 text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
                  )}
                  <span className={`${userReaction ? 'text-[#FF2600]' : 'text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300'} text-[14px] relative top-[1px] truncate max-w-[60px] ml-[3px]`}>
                    {userReaction ? userReaction.label : "반응"}
                  </span>
                </button>

                {/* 반응 팝업 */}
                {showReactionPopup && (
                  <div 
                    ref={popupRef}
                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-xl animate-slideUp z-50"
                  >
                    <div className="flex gap-2">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReactionSelect(reaction);
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-200 ${
                            userReaction?.id === reaction.id ? 'bg-gray-100 dark:bg-neutral-800' : ''
                          }`}
                        >
                          <span className="text-2xl mb-1">{reaction.emoji}</span>
                          <span className="text-xs text-gray-600 dark:text-neutral-400">{reaction.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 댓글 버튼 - 중앙 고정 */}
              <div className="flex-1 max-w-[33%] flex justify-center">
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
                  className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-3 py-2"
                >
                  <MessageIcon className="w-[22px] h-[22px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
                  <span className="ml-[3px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300 text-[14px] relative top-[1px]">댓글</span>
                </button>
              </div>

              {/* 공유 버튼 */}
              <div className="flex-1 max-w-[33%] flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-3 py-2"
                >
                  <ShareIcon className="w-[22px] h-[22px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
                  <span className="ml-[3px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300 text-[14px] relative top-[1px]">공유</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 영역 전체를 감싸는 컨테이너 */}
      <div className="w-full px-4 mt-4">
        <div className="max-w-[590px] mx-auto">
          {/* 댓글 입력 영역 */}
          <div className="bg-gray-100 dark:bg-[#121212] rounded-2xl">
            <form onSubmit={handleCommentSubmit}>
              <div className="bg-gray-100 dark:bg-[#121212] rounded-2xl p-[12px] w-full">
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
                            className="flex-1 bg-transparent resize-none border-none focus:outline-none focus:ring-0 text-[15px] text-gray-900 dark:text-neutral-300 placeholder-gray-400 dark:placeholder-neutral-500 overflow-hidden"
                            style={{
                              minHeight: '24px',
                              height: commentContent ? 'auto' : '24px'
                            }}
                            onInput={(e) => {
                              e.target.style.height = '24px';
                              e.target.style.height = Math.max(24, e.target.scrollHeight) + 'px';
                            }}
                          />
                          <div className="flex-shrink-0">
                            <PrimaryButton type="submit">
                              {location.state?.isEditing ? '수정' : '올리기'}
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
                            <div className="text-[15px] text-gray-400 dark:text-neutral-500">
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
            <div className="mt-4 bg-gray-100 dark:bg-[#121212] rounded-2xl">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <CommentCard
                    comment={{
                      ...comment,
                      authorPhotoURL: comment.authorPhotoURL,
                      userId: comment.authorId,
                    }}
                    postAuthorId={post.authorId}
                    onEdit={(newContent) => handleEditComment(comment.id, newContent)}
                    onDelete={() => handleDeleteComment(comment.id)}
                  />
                  {index !== comments.length - 1 && (
                    <div className="h-[1px] bg-gray-200 dark:bg-neutral-800" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-neutral-900 text-white px-4 py-2 rounded-lg">
          링크가 복사되었습니다!
        </div>
      )}
    </div>
  );
}

export default PostDetail; 