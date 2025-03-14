import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, updateLikes } from '../api/firebase';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageIcon, LikeIcon, ShareIcon } from './Icons';  // 상단에 import 추가

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

function PostCard({ post, categories, onShare }) {
  const [categoryName, setCategoryName] = useState('');
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { isLoggedIn, user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // prop으로 전달된 categories 배열에서 해당 post의 카테고리를 찾습니다.
    if (categories && categories.length > 0) {
      const category = categories.find(cat => cat.id === post.categoryId);
      if (category) {
        setCategoryName(category.name);
      }
    }

    // posts 문서에 저장된 commentCount 값을 사용
    setCommentCount(post.commentCount || 0);

    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
  }, [categories, post.categoryId, post.likedBy, post.id, user, post.commentCount]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 낙관적 업데이트: 이전 상태 저장
    const previousIsLiked = isLiked;
    const previousLikes = likes;
    // 즉시 UI에 반영 (좋아요 추가/감소)
    setIsLiked(!previousIsLiked);
    setLikes(previousIsLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const updatedPost = await updateLikes(post.id, user.uid, user.displayName || '익명');
      // 서버 응답에 따라 상태 보정
      setLikes(updatedPost.likes);
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const getRelativeTime = (date) => {
    return dayjs(date).fromNow();
  };

  const getDefaultProfileImage = () => {
    return 'https://via.placeholder.com/40x40';  // 또는 다른 기본 이미지
  };

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="block rounded-lg transition-colors duration-200"
    >
      <div className="flex flex-col h-full">
        {/* 컨텐츠 영역 내에 프로필 영역 포함 */}
        <div className="bg-[#F5F5F7] dark:bg-[#121212] rounded-2xl pt-[14px] p-5 pb-3 flex flex-col h-[360px]">
          {/* 프로필 영역 - 타이틀 상단에 표시 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={imageError ? getDefaultProfileImage() : (post.authorPhotoURL || getDefaultProfileImage())}
                  alt={`${post.authorName}의 프로필`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (!imageError) {
                      setImageError(true);
                    }
                  }}
                />
              </div>
              <div className="ml-2">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-neutral-300">
                  {post.authorName}
                </div>
                <div className="text-[12px] text-gray-500 dark:text-neutral-500">
                  <span>{categoryName}</span>
                  <span className="mx-1">·</span>
                  <span>{getRelativeTime(post.createdAt?.toDate())}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 더보기 옵션에 대한 처리 로직 추가 가능
              }} 
              className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-neutral-800"
            >
              <span className="text-gray-300 dark:text-neutral-500 text-sm transition-colors hover:text-gray-900 dark:hover:text-neutral-300">⋮</span>
            </button>
          </div>

          {/* 타이틀 */}
          <h2 
            className="text-[19px] font-semibold text-gray-900 dark:text-neutral-300 mb-[6px]" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {post.title}
          </h2>

          {/* 컨텐츠 */}
          <p
            className="text-[15px] text-gray-700 dark:text-neutral-400"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: '5',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {post.content}
          </p>

          {/* 좋아요/댓글 수 표시 */}
          <div className="mt-auto flex items-center justify-between text-[14px] text-gray-500 dark:text-neutral-500 pb-3">
            <span>{likes || 0}명의 반응</span>
            <span>댓글 {commentCount || 0}</span>
          </div>

          {/* 좋아요/댓글/공유 버튼 컨테이너 */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-900 pt-3 -mx-5 px-5">
            {/* 좋아요 버튼 */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike(e);
              }}
              className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-2 py-1"
            >
              <LikeIcon className="w-[22px] h-[22px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
              <span className="ml-[2px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300 text-[14px] relative top-[1px]">
                {isLiked ? "반응 취소" : "반응"}
              </span>
            </button>

            {/* 댓글 버튼 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/posts/${post.id}`);
              }}
              className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-2 py-1"
            >
              <MessageIcon className="w-[22px] h-[22px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
              <span className="ml-[2px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300 text-[14px] relative top-[1px]">댓글</span>
            </button>

            {/* 공유 버튼 */}
            <button
              onClick={(e) => onShare(e, post.id)}
              className="flex items-center hover:bg-gray-200 dark:hover:bg-neutral-800 group transition-colors duration-200 rounded-full px-2 py-1"
            >
              <ShareIcon className="w-[22px] h-[22px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300" />
              <span className="ml-[2px] text-gray-600 dark:text-neutral-500 group-hover:text-gray-800 dark:group-hover:text-neutral-300 text-[14px] relative top-[1px]">공유</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 