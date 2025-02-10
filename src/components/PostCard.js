import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, updateLikes } from '../api/firebase';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageIcon, LikeIcon } from './Icons';  // 상단에 import 추가

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

function PostCard({ post, categories }) {
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
        {/* 말풍선(컨텐츠) 컨테이너: 회색 배경, 고정 높이 300px, 라운드 값을 증가시킴 */}
        <div className="bg-gray-100 rounded-2xl p-5 flex flex-col h-[300px]">
          <div>
            <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
              {/* 카테고리 레이블 왼쪽에 16px 아이콘 */}
              <svg 
                className="w-4 h-4 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
              </svg>
              {categoryName}
            </div>
            {/* 타이틀에 말줄임표 처리 적용 (한 줄) */}
            <h2 
              className="text-xl font-semibold text-gray-900 mb-2" 
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
            {/* 컨텐츠에 말줄임표 처리: 최대 5줄까지 표시 */}
            <p
              className="text-gray-600"
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
          </div>
          {/* 좋아요/댓글 버튼 컨테이너 - 왼쪽에는 버튼 아이콘, 오른쪽에는 텍스트로 숫자 표시 */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(e);
                }}
                className="flex items-center hover:bg-gray-200 transition-colors duration-200 rounded-full p-1"
              >
                <LikeIcon className="w-6 h-6 text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  // 댓글 버튼 클릭 시 상세 페이지로 이동
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/posts/${post.id}`);
                }}
                className="flex items-center hover:bg-gray-200 transition-colors duration-200 rounded-full p-1"
              >
                <MessageIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              좋아요 {likes || 0} <span className="mx-1">·</span> 댓글 {commentCount || 0}
            </div>
          </div>
        </div>
        {/* 프로필 컨테이너 (배경 컬러 제거, 상단에 10px padding) */}
        <div className="rounded-b-xl flex items-center bg-transparent pt-[10px]">
          <div className="w-10 h-10 rounded-full overflow-hidden">
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
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {post.authorName}
            </div>
            <div className="text-xs text-gray-500">
              {getRelativeTime(post.createdAt?.toDate())}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 