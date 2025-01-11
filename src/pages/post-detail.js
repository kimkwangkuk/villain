import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentCard from '../components/CommentCard';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post with ID:', id);
        const postDoc = await getDoc(doc(db, 'posts', id));
        
        if (postDoc.exists()) {
          console.log('Post data:', postDoc.data());
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          setError('포스트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('포스트를 불러오는데 실패했습니다:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribeComments = onSnapshot(
      collection(db, 'posts', id, 'comments'),
      (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPost(prev => prev ? { ...prev, comments } : null);
      },
      (error) => {
        console.error('댓글 구독 에러:', error);
        setError(error.message);
      }
    );

    fetchPost();
    return () => unsubscribeComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await addDoc(collection(db, 'posts', id, 'comments'), {
        content: commentContent.trim(),
        userId: user.uid,
        author: user.email,
        createdAt: new Date()
      });
      
      setCommentContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  if (loading) return <div className="text-center py-8">로딩중...</div>;
  
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  
  if (!post) return <div className="text-center py-8">포스트를 찾을 수 없습니다.</div>;

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