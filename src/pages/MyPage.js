import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPosts, getUserInteractions, getPost } from '../api/firebase';
import PostCard from '../components/PostCard';

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [interestedPosts, setInterestedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');

  useEffect(() => {
    // 로그인 상태 체크
    if (!isLoggedIn) {
      console.log('사용자가 로그인하지 않았습니다.');
      navigate('/login');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        console.log('내 게시글을 가져오는 중...');
        const filteredPosts = await getMyPosts(user?.uid);
        console.log('가져온 게시글:', filteredPosts);
        setMyPosts(filteredPosts);
      } catch (error) {
        console.error('내 게시글 로딩 실패:', error);
      }
    };

    const fetchUserInteractions = async () => {
      try {
        console.log('내 관심 포스트를 가져오는 중...');
        const interactions = await getUserInteractions(user?.uid);
        const filteredPosts = await Promise.all(interactions.map(async (interaction) => {
          const post = await getPost(interaction.postId);
          return post;
        }));
        setInterestedPosts(filteredPosts);
      } catch (error) {
        console.error('내 관심 포스트 로딩 실패:', error);
      }
    };

    fetchMyPosts();
    fetchUserInteractions().then(() => {
      setLoading(false);
    });
  }, [user, isLoggedIn, navigate]);

  if (!isLoggedIn) return null;
  if (loading) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 포스트</h1>

        <div className="mb-4">
          <button
            onClick={() => setActiveTab('myPosts')}
            className={`px-4 py-2 rounded-md ${activeTab === 'myPosts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            내 포스트
          </button>
          <button
            onClick={() => setActiveTab('interestedPosts')}
            className={`px-4 py-2 rounded-md ${activeTab === 'interestedPosts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            내 관심 포스트
          </button>
        </div>

        {activeTab === 'myPosts' ? (
          myPosts.length === 0 ? (
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
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )
        ) : (
          interestedPosts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">아직 관심 포스트가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interestedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MyPage; 