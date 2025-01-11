import { useState, useEffect } from 'react';
import { getCategories } from '../api/firebase';

function PostCard({ post }) {
  const [categoryName, setCategoryName] = useState('');

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-sm text-blue-600 mb-2">
        {categoryName}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>작성자: {post.authorName}</span>
        <span>👍 {post.likes || 0}</span>
      </div>
    </div>
  );
}

export default PostCard; 