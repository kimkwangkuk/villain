import { useState, useEffect } from 'react';
import { getPosts, getCategories, getUserDoc } from '../api/firebase';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import { 
  AllCategoryIcon, 
  CategoryIcon1, 
  CategoryIcon2, 
  CategoryIcon3, 
  CategoryIcon4, 
  CategoryIcon5, 
  CategoryIcon6, 
  CategoryIcon7, 
  CategoryIcon8, 
  CategoryIcon9 
} from '../components/Icons';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, categoriesData] = await Promise.all([
          getPosts(),
          getCategories()
        ]);
        setPosts(postsData);
        setCategories(categoriesData);

        const uniqueAuthorIds = [...new Set(postsData.map(post => post.authorId))];
        const authorPromises = uniqueAuthorIds.map(id => getUserDoc(id));
        const authorData = await Promise.all(authorPromises);
        setAuthors(
          authorData.map((data, index) => ({
            id: uniqueAuthorIds[index],
            name: data.username || '이름 없음',
            profile: data.photoURL
          }))
        );
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

  const getDefaultProfileImage = (authorId) => {
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${authorId}&backgroundColor=e8f5e9`;
  };

  if (loading) return <div>로딩중...</div>;

  // '전체' 버튼은 AllCategoryIcon을 사용하고,
  // 나머지 카테고리 버튼은 순서대로 9개의 아이콘을 할당 (순환 없이 사용)
  const categoryIcons = [
    CategoryIcon1,
    CategoryIcon2,
    CategoryIcon3,
    CategoryIcon4,
    CategoryIcon5,
    CategoryIcon6,
    CategoryIcon7,
    CategoryIcon8,
    CategoryIcon9
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto whitespace-nowrap pt-4 px-4 gap-8">
            {/* 전체 버튼 */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-[15px] font-medium pb-2 px-1 transition-colors text-black
                ${!selectedCategory ? "border-b-2 border-black" : ""}`}
            >
              <div className="flex flex-col items-center gap-[10px]">
                <AllCategoryIcon className="w-[28px] h-[28px]" />
                <span>전체</span>
              </div>
            </button>
            {/* 동적으로 불러온 카테고리 버튼 (총 9개 아이콘 할당) */}
            {categories.map((category, index) => {
              // index로 직접 접근 (순환하지 않음)
              const IconComponent = categoryIcons[index];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-[15px] font-medium pb-2 px-1 transition-colors text-black
                    ${selectedCategory === category.id ? "border-b-2 border-black" : ""}`}
                >
                  <div className="flex flex-col items-center gap-[10px]">
                    {IconComponent && <IconComponent className="w-[28px] h-[28px]" />}
                    <span>{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto whitespace-nowrap py-2 gap-6">
            {authors.map((author) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 