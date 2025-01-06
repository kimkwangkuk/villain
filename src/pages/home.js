import { useState, useEffect } from 'react';
import { getPosts, getCategories } from '../api/axios';
import PostCard from '../components/posts/PostCard';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          getPosts(),
          getCategories()
        ]);
        console.log('받아온 카테고리:', categoriesResponse.data);
        setPosts(postsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">빌런 카테고리</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map(category => (
              <div 
                key={category._id}
                className="bg-white rounded-lg shadow px-4 py-2 min-w-[150px]"
              >
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">게시글 목록</h1>
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage; 