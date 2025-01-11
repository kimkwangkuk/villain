import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts } from '../api/firebase';
import PostCard from '../components/PostCard';

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 상태 체크
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const allPosts = await getPosts();
        const filteredPosts = allPosts.filter(post => post.authorId === user?.uid);
        setMyPosts(filteredPosts);
      } catch (error) {
        console.error('내 게시글 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyPosts();
    }
  }, [user, isLoggedIn, navigate]);

  if (!isLoggedIn) return null;
  if (loading) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 게시글</h1>
        
        {myPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">아직 작성한 게시글이 없습니다.</p>
            <Link 
              to="/posts/new" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              첫 게시글 작성하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.map(post => (
              <Link to={`/posts/${post.id}`} key={post.id}>
                <PostCard post={post} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPage; 