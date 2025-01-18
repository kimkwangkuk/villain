import { useState, useEffect } from 'react';
import { getPosts, getCategories } from '../api/firebase';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

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

  const authors = filteredPosts.reduce((acc, post) => {
    if (!acc.some(author => author.id === post.authorId)) {
      acc.push({ id: post.authorId, name: post.authorName, profile: post.authorProfile });
    }
    return acc;
  }, []);

  const getDefaultProfileImage = (authorId) => {
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${authorId}&backgroundColor=e8f5e9`;
  };

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

      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto whitespace-nowrap py-2 gap-6">
            {authors.map(author => (
              <Link
                key={author.id}
                to={`/user/${author.id}`}
                className="flex flex-col items-center space-y-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={author.profile || getDefaultProfileImage(author.id)}
                    alt={`${author.name}의 프로필`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getDefaultProfileImage(author.id);
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{author.name}</span>
              </Link>
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