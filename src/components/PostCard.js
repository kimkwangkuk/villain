import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

function PostCard({ post }) {
  const [categoryName, setCategoryName] = useState('');
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { isLoggedIn, user } = useAuth();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const categories = await getCategories();
        const category = categories.find(cat => cat.id === post.categoryId);
        if (category) {
          setCategoryName(category.name);
        }
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
      }
    };

    // 댓글 수 실시간 업데이트
    const commentsQuery = query(collection(db, 'posts', post.id, 'comments'));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      setCommentCount(snapshot.size);
    });

    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }

    fetchCategoryName();
    return () => unsubscribe();  // cleanup
  }, [post.categoryId, post.likedBy, post.id, user]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const updatedPost = await updateLikes(post.id, user.uid);
      setLikes(updatedPost.likes);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 실패:', error);
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
      className="block px-1 pb-1 rounded-[20px] overflow-hidden bg-[#F0F0F0] hover:bg-gray-100 transition-colors duration-200 h-[360px] flex flex-col"
    >
      {/* 카테고리 영역 */}
      <div className="px-5 pt-[12px] pb-[9px]">
        <div className="text-[14px] font-medium text-gray-500">
          {categoryName}
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="bg-white rounded-2xl pt-[17px] p-5 flex-1 flex flex-col">
        {/* 게시글 제목 */}
        <h2 className="text-[20px] font-semibold text-gray-900 mb-2">
          {post.title}
        </h2>

        {/* 게시글 내용 (영역을 넘어갈 경우 말줄임표 처리) */}
        <p 
          className="overflow-hidden text-gray-600" 
          style={{
            display: '-webkit-box',
            WebkitLineClamp: '7',
            WebkitBoxOrient: 'vertical'
          }}
        >
          {post.content}
        </p>

        {/* 하단 프로필 및 상호작용 영역 */}
        <div className="flex items-center justify-between mt-auto">
          {/* 프로필 영역 */}
          <div className="flex items-center space-x-2">
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden">
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
            <div>
              <div className="text-[14px] font-medium text-gray-900">
                {post.authorName}
              </div>
              <div className="text-xs text-gray-500">
                {getRelativeTime(post.createdAt?.toDate())}
              </div>
            </div>
          </div>

          {/* 좋아요 및 댓글 카운트 */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike(e);
              }}
              className="flex items-center space-x-1 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-full p-2"
            >
              <LikeIcon className="w-6 h-6 text-gray-500" />
              <span className="text-[14px] font-medium">{likes || 0}</span>
            </button>
            <button
              className="flex items-center space-x-1 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-full p-2"
            >
              <MessageIcon className="w-6 h-6 text-gray-500" />
              <span className="text-[14px] font-medium">{commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 