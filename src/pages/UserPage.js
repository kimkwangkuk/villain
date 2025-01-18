import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMyPosts } from '../api/firebase';
import PostCard from '../components/PostCard';

function UserPage() {
  const { userId } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const posts = await getMyPosts(userId);
        setUserPosts(posts);
      } catch (error) {
        console.error('사용자 게시글 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) return <div>로딩중...</div>;

  const author = userPosts[0]?.authorName ? {
    id: userId,
    name: userPosts[0].authorName,
    profile: userPosts[0].authorPhotoURL
  } : null;

  const getDefaultProfileImage = (authorId) => {
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${authorId}&backgroundColor=e8f5e9`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-8">
            <div className="flex items-start">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={author?.profile || getDefaultProfileImage(userId)}
                    alt={`${author?.name || '사용자'}의 프로필`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getDefaultProfileImage(userId);
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {author?.name || '사용자'}
                  </h2>
                  <p className="text-gray-500">
                    작성한 게시글 {userPosts.length}개
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {userPosts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">작성한 게시글이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPage; 