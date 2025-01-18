import { useState, useEffect } from 'react';
import { getPosts, getCategories } from '../api/firebase';
import PostCard from '../components/PostCard';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, categoriesData] = await Promise.all([
          getPosts(),
          getCategories()
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.categoryId === selectedCategory)
    : posts;

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto whitespace-nowrap py-4 px-4 gap-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-[17px] font-semibold pb-2 px-1 transition-colors text-black
                ${!selectedCategory ? 'border-b-2 border-black' : ''}`}
            >
              전체
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-[17px] font-semibold pb-2 px-1 transition-colors text-black
                  ${selectedCategory === category.id ? 'border-b-2 border-black' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 