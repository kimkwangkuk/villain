import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { updateCommentLikes, addReply, getReplies, deleteReply, deleteComment, reportContent, hasAlreadyReported } from '../api/firebase';
import { LikeIcon, MessageIcon, EllipsisIcon } from '../components/Icons';
import { PrimaryButton, LineButton } from '../components/Button';
import { ReplyModal } from './Modal';

function CommentCard({ comment, postAuthorId, onEdit, onDelete }) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [commentLikes, setCommentLikes] = useState(comment.likes || 0);
  const [liked, setLiked] = useState(user && comment.likedBy ? comment.likedBy.includes(user.uid) : false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const menuRef = useRef(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMenuOpen, setReplyMenuOpen] = useState(null);
  const replyMenuRef = useRef(null);

  // 바깥 영역 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
    const handleClickOutside = (event) => {
      if (replyMenuRef.current && !replyMenuRef.current.contains(event.target)) {
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
  const formatDate = (date) => {
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
      setCommentLikes(updatedComment.likes);
      setLiked(updatedComment.likedBy.includes(user.uid));
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
  const handleReplySubmit = async (replyContent) => {
    if (!replyContent.trim()) return;

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
      throw error; // 에러를 그대로 throw하여 호출자가 처리할 수 있게 함
    }
  };

  // 대댓글 삭제 처리
  const handleDeleteReply = async (replyId) => {
    try {
      // 낙관적 업데이트: UI에서 먼저 대댓글 제거
      setReplies(prev => prev.filter(reply => reply.id !== replyId));
      await deleteReply(comment.postId, comment.id, replyId);
    } catch (error) {
      // 실패 시 이전 상태로 복원
      setReplies(prev => [...prev, replies.find(reply => reply.id === replyId)]);
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
  const handleReportReply = async (replyId) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 이미 신고한 대댓글인지 확인
      const alreadyReported = await hasAlreadyReported('reply', replyId, user.uid);
      if (alreadyReported) {
        alert('이미 신고한 답글입니다.');
        return;
      }

      await reportContent('reply', replyId, user.uid, '부적절한 내용');
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('답글 신고 실패:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  // 대댓글 모달 열기
  const handleOpenReplyModal = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowReplyModal(true);
  };

  return (
    <div className="py-[16px]">
      {/* 상단 영역: 프로필 정보와 더보기 버튼 */}
      <div className="flex justify-between items-start px-[20px]">
        {/* 프로필 정보 그룹 - 프로필 이미지와 내용 영역을 분리 */}
        <div className="flex space-x-3 flex-1">
          {/* 프로필 이미지 */}
          <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0">
            {comment.isDeleted ? (
              <div className="w-full h-full bg-gray-300 dark:bg-neutral-700" />
            ) : (
              comment.authorPhotoURL ? (
                <img
                  src={comment.authorPhotoURL}
                  alt={comment.authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 이니셜 표시
                    e.target.parentNode.innerHTML = `<div class="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                      <span class="text-xs text-gray-600 dark:text-gray-400">
                        ${comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )
            )}
          </div>

          {/* 이름/시간 및 내용 영역 */}
          <div className="flex-1 min-w-0">
            {/* 이름과 시간 */}
            <div className="flex items-center space-x-2">
              <span className={`text-[13px] font-medium ${comment.isDeleted ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-900 dark:text-neutral-300'}`}>
                {comment.isDeleted ? '삭제된 댓글' : (comment.authorName || '익명')}
              </span>
              <span className="text-[13px] text-gray-400 dark:text-neutral-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* 댓글 내용 */}
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-300 dark:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="2"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitEdit}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    수정완료
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-[15px] mt-[2px] ${comment.isDeleted ? 'text-gray-400 dark:text-neutral-500 italic' : 'text-gray-700 dark:text-neutral-400'}`}>
                {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
              </p>
            )}

            {/* 좋아요/답글 버튼 영역 - 삭제된 댓글이 아닐 때만 표시 */}
            {!comment.isDeleted && (
              <div className="mt-2 flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  disabled={isLikeLoading}
                  className="flex items-center text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
                >
                  <LikeIcon className={`w-[18px] h-[18px] ${liked ? 'text-red-500' : ''}`} />
                  <span className={`ml-1 text-[13px] ${liked ? 'text-red-500' : ''}`}>
                    {commentLikes > 0 ? commentLikes : '좋아요'}
                  </span>
                </button>
                
                <button 
                  onClick={() => {
                    if (replies.length > 0) {
                      setShowReplies(!showReplies);
                    } else {
                      handleOpenReplyModal();
                    }
                  }}
                  className="flex items-center text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
                >
                  <MessageIcon className="w-[18px] h-[18px]" />
                  <span className="ml-1 text-[13px]">
                    {replies.length > 0 
                      ? `${showReplies ? '답글 접기' : '답글'} ${replies.length}` 
                      : '답글'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 더보기 버튼 & 메뉴 - 삭제된 댓글이 아닐 때만 표시 */}
        {user && !comment.isDeleted && (
          <div className="relative ml-3" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-neutral-800"
            >
              <EllipsisIcon className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-neutral-900 rounded-lg shadow-lg dark:shadow-black z-10 py-1">
                {user.uid === comment.authorId ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                          handleDeleteComment();
                        }
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleReportComment();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    신고
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 대댓글 목록 - 답글 있고 showReplies가 true일 때만 표시 */}
      {replies.length > 0 && showReplies && (
        <div className="mt-3 ml-[56px] mr-[20px] bg-gray-200 dark:bg-[#0d0d0d] rounded-lg">
          {/* 대댓글 목록 */}
          <div className="pt-0">
            {replies.map((reply, index) => (
              <div key={reply.id}>
                <div className="flex justify-between items-start py-3 px-3">
                  {/* 대댓글 내용 레이아웃도 동일하게 변경 */}
                  <div className="flex space-x-3 flex-1">
                    {/* 프로필 이미지 */}
                    <div className="w-[28px] h-[28px] rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0">
                      {reply.authorPhotoURL ? (
                        <img
                          src={reply.authorPhotoURL}
                          alt={reply.authorName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패 시 이미지 태그 제거하고 이니셜 표시
                            e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center">
                              <span class="text-xs text-gray-600 dark:text-gray-400">
                                ${reply.authorName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {reply.authorName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 대댓글 정보 및 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[13px] font-medium ${reply.isDeleted ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-900 dark:text-neutral-300'}`}>
                          {reply.isDeleted ? '삭제된 댓글' : reply.authorName}
                        </span>
                        <span className="text-[13px] text-gray-400 dark:text-neutral-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className={`text-[15px] mt-[2px] ${reply.isDeleted ? 'text-gray-400 dark:text-neutral-500 italic' : 'text-gray-700 dark:text-neutral-400'}`}>
                        {reply.isDeleted ? '삭제된 댓글입니다.' : reply.content}
                      </p>
                    </div>
                  </div>
                  
                  {/* 대댓글 더보기 버튼 */}
                  {!reply.isDeleted && (
                    <div className="relative ml-2" ref={replyMenuRef}>
                      <button 
                        onClick={() => setReplyMenuOpen(replyMenuOpen === reply.id ? null : reply.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-neutral-800"
                      >
                        <EllipsisIcon className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                      </button>
                      
                      {replyMenuOpen === reply.id && (
                        <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-neutral-900 rounded-lg shadow-lg dark:shadow-black z-10 py-1">
                          {user && (user.uid === reply.authorId) && (
                            <button
                              onClick={() => {
                                if (window.confirm('정말로 이 답글을 삭제하시겠습니까?')) {
                                  handleDeleteReply(reply.id);
                                }
                                setReplyMenuOpen(null);
                              }}
                              className="w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                              삭제
                            </button>
                          )}
                          
                          {user && user.uid !== reply.authorId && (
                            <button
                              onClick={() => {
                                handleReportReply(reply.id);
                                setReplyMenuOpen(null);
                              }}
                              className="w-full text-left px-3 py-1 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                              신고
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {index !== replies.length - 1 && (
                  <div className="h-[1px] w-full bg-gray-300 dark:bg-neutral-800" />
                )}
              </div>
            ))}
            
            {/* 더 답글달기 버튼 */}
            <div className="py-2 px-3">
              <button
                onClick={handleOpenReplyModal}
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                답글 달기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 대댓글 입력 모달 */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSubmit={handleReplySubmit}
        comment={comment}
      />
    </div>
  );
}

export default CommentCard;