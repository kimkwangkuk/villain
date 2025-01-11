import { useState, useEffect } from 'react';
import { getCategories, updateLikes } from '../api/firebase';
import { useAuth } from '../hooks/useAuth';

function PostCard({ post }) {
  const [categoryName, setCategoryName] = useState('');
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const { isLoggedIn } = useAuth();

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

    fetchCategoryName();
  }, [post.categoryId]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const updatedPost = await updateLikes(post.id);
      setLikes(updatedPost.likes);
      setIsLiked(true);
    } catch (error) {
      console.error('좋아요 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-sm text-blue-600 mb-2">
        {categoryName}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>작성자: {post.authorName}</span>
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'hover:text-blue-500'}`}
          disabled={isLiked}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard; 