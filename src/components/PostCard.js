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
    return 'https://api.dicebear.com/9.x/notionists-neutral/svg?seed=' + post.authorId + '&backgroundColor=e8f5e9';
  };

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="block bg-white rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
    >
      <div className="text-sm text-blue-600 mb-2">
        {categoryName}
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={post.authorPhotoURL || getDefaultProfileImage()}
              alt={`${post.authorName}의 프로필`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getDefaultProfileImage();
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
          <span className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">👁️</span>
            {post.viewCount || 0}
          </span>
          <div className="flex items-center space-x-1">
            <span>💬</span>
            <span>{commentCount}</span>
          </div>
          <div 
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.preventDefault()}
          >
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 