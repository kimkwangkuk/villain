import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, addComment } from '../api/axios';
import CommentCard from '../components/CommentCard';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPost(id);
        console.log('받은 데이터:', response.data);
        console.log('댓글 데이터:', response.data.comments);
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-6">{post.content}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>작성자: {post.author}</span>
            <span>👍 {post.likes || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">댓글</h2>
          {Array.isArray(post.comments) && post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map(comment => (
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail; 