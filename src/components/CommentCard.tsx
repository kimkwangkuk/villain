import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { updateCommentLikes, addReply, getReplies, deleteReply, deleteComment } from '@/api/comment';
import { reportContent, hasAlreadyReported } from '@/api/report';
import { LikeIcon, MessageIcon, EllipsisIcon } from '@/components/Icons';
import { PrimaryButton, LineButton } from '@/components/Button';
import { ReplyModal } from './Modal';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: any;
  updatedAt?: any;
  postId: string;
  likes?: number;
  likedBy?: string[];
  isReply?: boolean;
}

interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: any;
  postId: string;
}

interface CommentCardProps {
  comment: Comment;
  postAuthorId: string;
  onEdit: (content: string) => void;
  onDelete: () => void;
}

function CommentCard({ comment, postAuthorId, onEdit, onDelete }: CommentCardProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [commentLikes, setCommentLikes] = useState(comment.likes || 0);
  const [liked, setLiked] = useState(user && comment.likedBy ? comment.likedBy.includes(user.uid) : false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMenuOpen, setReplyMenuOpen] = useState<string | null>(null);
  const replyMenuRef = useRef<HTMLDivElement>(null);

  // 바깥 영역 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 바깥 영역 클릭 감지 (대댓글 메뉴용)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replyMenuRef.current && !replyMenuRef.current.contains(event.target as Node)) {
        setReplyMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  // 수정 완료
  const handleSubmitEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  // 기본 프로필 이미지 가져오기
  const getDefaultProfileImage = () => {
    return '';  // 기본 이미지 URL 제거
  };

  // 날짜 포맷팅 함수
  const formatDate = (date: any) => {
    if (!date) return '';
    // Firebase Timestamp 객체인 경우
    if (date.toDate) {
      return dayjs(date.toDate()).format('YYYY.MM.DD');
    }
    // 이미 Date 객체이거나 문자열인 경우
    return dayjs(date).format('YYYY.MM.DD');
  };

  // 댓글 좋아요 버튼 클릭 시 호출할 함수
  const handleLike = async () => {
    if (!user?.uid) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 처리 중이면 중복 요청 방지
    if (isLikeLoading) return;

    // 이전 상태 저장
    const previousLiked = liked;
    const previousLikes = commentLikes;

    // 낙관적 업데이트
    setLiked(!previousLiked);
    setCommentLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      setIsLikeLoading(true);
      const updatedComment = await updateCommentLikes(comment.id, user.uid);
      // 서버 응답으로 상태 동기화
      setCommentLikes(updatedComment.likes ?? 0);
      setLiked((updatedComment.likedBy ?? []).includes(user.uid));
    } catch (error) {
      // 실패 시 이전 상태로 롤백
      setLiked(previousLiked);
      setCommentLikes(previousLikes);
      console.error('댓글 좋아요 업데이트 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  // 대댓글 목록 가져오기
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const replyList = await getReplies(comment.id);
        setReplies(replyList);
      } catch (error) {
        console.error('대댓글 로딩 실패:', error);
      }
    };
    fetchReplies();
  }, [comment.id]);

  // 대댓글 작성 처리
  const handleReplySubmit = async (replyContent: string) => {
    if (!replyContent.trim()) return false;

    try {
      const newReply = await addReply(comment.postId, comment.id, replyContent);
      if (newReply) {
        setReplies(prev => [...prev, newReply]);
        setShowReplyModal(false);
        setShowReplies(true);
      }
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      alert('대댓글 작성에 실패했습니다.');
      return false;
    }
  };

  // 대댓글 삭제 처리
  const handleDeleteReply = async (replyId: string) => {
    try {
      // 낙관적 업데이트: UI에서 먼저 대댓글 제거
      setReplies(prev => prev.filter(reply => reply.id !== replyId));
      await deleteReply(comment.postId, comment.id, replyId);
    } catch (error) {
      // 실패 시 이전 상태로 복원
      const deletedReply = replies.find(reply => reply.id === replyId);
      if (deletedReply) {
        setReplies(prev => [...prev, deletedReply]);
      }
      console.error('대댓글 삭제 실패:', error);
      alert('대댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 삭제 처리 - 확인 메시지 제거
  const handleDeleteComment = async () => {
    try {
      // 여기서는 실제 삭제 작업을 수행하지 않고 부모 컴포넌트에 알림만 전달
      onDelete && onDelete();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 신고 처리
  const handleReportComment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 이미 신고한 댓글인지 확인
      const alreadyReported = await hasAlreadyReported('comment', comment.id, user.uid);
      if (alreadyReported) {
        alert('이미 신고한 댓글입니다.');
        return;
      }

      await reportContent('comment', comment.id, user.uid, '부적절한 내용');
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('댓글 신고 실패:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  // 대댓글 신고 처리
  const handleReportReply = async (replyId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 이미 신고한 대댓글인지 확인
      const alreadyReported = await hasAlreadyReported('reply', replyId, user.uid);
      if (alreadyReported) {
        alert('이미 신고한 댓글입니다.');
        return;
      }

      await reportContent('reply', replyId, user.uid, '부적절한 내용');
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('대댓글 신고 실패:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  const handleOpenReplyModal = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowReplyModal(true);
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex flex-col">
        {/* 댓글 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {/* 프로필 이미지 */}
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
              {comment.authorPhotoURL && !imageError ? (
                <img 
                  src={comment.authorPhotoURL} 
                  alt={`${comment.authorName}의 프로필`} 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            
            {/* 작성자 정보 */}
            <div>
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-900 dark:text-neutral-200">
                  {comment.authorName || '익명'}
                </span>
                {comment.authorId === postAuthorId && (
                  <span className="ml-1 px-1 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">작성자</span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-neutral-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* 더보기 메뉴 */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
            >
              <EllipsisIcon className="w-4 h-4 text-gray-500 dark:text-neutral-500" />
            </button>
            
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-md shadow-lg z-10 w-32 py-1"
              >
                {user && comment.authorId === user.uid && (
                  <>
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => {
                        handleDeleteComment();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      삭제
                    </button>
                  </>
                )}
                
                {(!user || comment.authorId !== user.uid) && (
                  <button 
                    onClick={() => {
                      handleReportComment();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  >
                    신고
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 댓글 내용 */}
        <div className="mt-1 pl-10">
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button 
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200"
                >
                  취소
                </button>
                <button 
                  onClick={handleSubmitEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  수정 완료
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-neutral-300 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* 좋아요, 답글 버튼 */}
          <div className="flex items-center mt-2 space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center text-xs ${liked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-neutral-500'} hover:text-blue-600 dark:hover:text-blue-400`}
              disabled={isLikeLoading}
            >
              <LikeIcon className={`w-4 h-4 mr-1 ${liked ? 'fill-blue-600 dark:fill-blue-400' : 'fill-none'}`} />
              <span>{commentLikes > 0 ? commentLikes : '좋아요'}</span>
            </button>
            
            <button 
              onClick={handleOpenReplyModal}
              className="flex items-center text-xs text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
            >
              <MessageIcon className="w-4 h-4 mr-1" />
              <span>답글</span>
            </button>
            
            {replies.length > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showReplies ? '답글 숨기기' : `답글 ${replies.length}개 보기`}
              </button>
            )}
          </div>

          {/* 대댓글 목록 */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start">
                  {/* 대댓글 프로필 이미지 */}
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    {reply.authorPhotoURL ? (
                      <img 
                        src={reply.authorPhotoURL} 
                        alt={`${reply.authorName}의 프로필`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentNode as HTMLElement;
                          if (parent) {
                            const span = document.createElement('span');
                            span.className = 'text-xs text-gray-600 dark:text-gray-400';
                            span.textContent = reply.authorName?.charAt(0)?.toUpperCase() || '?';
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {reply.authorName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  
                  {/* 대댓글 내용 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-xs text-gray-900 dark:text-neutral-200">
                            {reply.authorName || '익명'}
                          </span>
                          {reply.authorId === postAuthorId && (
                            <span className="ml-1 px-1 py-0.5 text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">작성자</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-800 dark:text-neutral-300 mt-0.5 whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                        <span className="text-[10px] text-gray-500 dark:text-neutral-500 mt-0.5 block">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      
                      {/* 대댓글 더보기 메뉴 */}
                      <div className="relative">
                        <button 
                          onClick={() => setReplyMenuOpen(replyMenuOpen === reply.id ? null : reply.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
                        >
                          <EllipsisIcon className="w-3 h-3 text-gray-500 dark:text-neutral-500" />
                        </button>
                        
                        {replyMenuOpen === reply.id && (
                          <div 
                            ref={replyMenuRef}
                            className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-md shadow-lg z-10 w-24 py-1"
                          >
                            {user && reply.authorId === user.uid && (
                              <button 
                                onClick={() => {
                                  handleDeleteReply(reply.id);
                                  setReplyMenuOpen(null);
                                }}
                                className="w-full text-left px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                              >
                                삭제
                              </button>
                            )}
                            
                            {(!user || reply.authorId !== user.uid) && (
                              <button 
                                onClick={() => {
                                  handleReportReply(reply.id);
                                  setReplyMenuOpen(null);
                                }}
                                className="w-full text-left px-3 py-1 text-xs text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
                              >
                                신고
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 대댓글 작성 모달 */}
      {showReplyModal && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          onSubmit={handleReplySubmit}
          commentAuthor={comment.authorName || '익명'}
        />
      )}
    </div>
  );
}

export default CommentCard; 