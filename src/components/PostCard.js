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

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="block bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="text-sm text-blue-600 mb-2">
        {categoryName}
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex flex-col">
          <span>작성자: {post.authorName}</span>
          <span className="text-xs text-gray-400">
            {getRelativeTime(post.createdAt?.toDate())}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">👁️</span> {/* 조회수 아이콘 */}
            {post.viewCount || 0} {/* 조회수 표시 */}
          </span>
          <div className="flex items-center space-x-1">
            <span>💬</span>
            <span>{commentCount}</span> {/* 댓글 수 표시 */}
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
              <span>{likes}</span> {/* 좋아요 수 표시 */}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 