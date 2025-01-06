import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../api/axios';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPost(id);
        setPost(response.data);
      } catch (error) {
        console.error('포스트를 불러오는데 실패했습니다:', error);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-6">{post.content}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>작성자: {post.author}</span>
            <span>👍 {post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail; 