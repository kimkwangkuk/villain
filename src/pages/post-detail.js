import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, addComment } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const { isLoggedIn } = useAuth();

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const response = await addComment(id, { 
        content: commentContent.trim() 
      });
      
      console.log('댓글 응답:', response.data);

      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data]
      }));
      setCommentContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

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
          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex flex-col space-y-2">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 작성해주세요"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
                <button
                  type="submit"
                  className="self-end px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={!commentContent.trim()}
                >
                  댓글 작성
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
          )}

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