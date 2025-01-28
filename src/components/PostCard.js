import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, updateLikes } from '../api/firebase';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';

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
      className="block bg-white rounded-xl p-6 cursor-pointer min-h-[320px] border border-gray-100
        hover:shadow-[0_15px_30px_-10px_rgba(51,65,85,0.1),0_25px_25px_-15px_rgba(79,70,229,0.1),0_-6px_15px_-10px_rgba(51,65,85,0.08)] 
        hover:scale-[1.02] transition-all duration-200 relative"
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-800">
              {categoryName}
            </div>
            <button 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <span className="text-gray-400">⋮</span>
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h2>
          <p className="text-gray-600 mb-6">{post.content}</p>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
            <div className="flex flex-col">
              <span>{post.authorName}</span>
              <span className="text-xs text-gray-400">
                {getRelativeTime(post.createdAt?.toDate())}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-full cursor-pointer">
              <span>💬</span>
              <span>{commentCount}</span>
            </div>
            <div 
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.preventDefault()}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>{(post.viewCount || 0) + (likes || 0)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 