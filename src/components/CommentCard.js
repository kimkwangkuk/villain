import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { updateCommentLikes } from '../api/firebase';
import { LikeIcon, MessageIcon, EllipsisIcon } from '../components/Icons';

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
    return 'https://via.placeholder.com/40x40';  // PostCard와 동일한 기본 이미지 사용
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

  return (
    <div className=" px-[20px] py-[16px]">
      {/* 상단 영역: 프로필 정보와 더보기 버튼 */}
      <div className="flex justify-between items-start">
        {/* 프로필 정보 그룹 */}
        <div className="flex items-center space-x-[6px]">
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden bg-gray-200">
            <img
              src={imageError ? getDefaultProfileImage() : (comment.authorPhotoURL || getDefaultProfileImage())}
              alt={comment.authorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!imageError) {
                  setImageError(true);
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[13px] font-medium text-gray-900">
                {comment.authorName || '익명'}
              </span>
              <span className="text-[13px] text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 더보기 버튼 & 메뉴 */}
        {user && (user.uid === comment.userId) && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="hover:bg-gray-100 rounded-full p-1"
            >
              <EllipsisIcon className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 py-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  수정
                </button>
                <button 
                  onClick={() => onDelete && onDelete()}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-500"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 댓글 내용 */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[60px] p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleSubmitEdit}
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              완료
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[15px] text-gray-900 mb-[12px] break-all whitespace-pre-wrap">
          {comment.content}
        </div>
      )}

      {/* 하단 액션 버튼들 */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleLike}
          disabled={isLikeLoading}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
        >
          <LikeIcon className={`w-[24px] h-[24px] ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`} />
          <span className="text-[13px]">{commentLikes}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <MessageIcon className="w-[24px] h-[24px] text-gray-500" />
          <span className="text-[13px]">답글달기</span>
        </button>
      </div>
    </div>
  );
}

export default CommentCard; 