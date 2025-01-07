import { useNavigate } from 'react-router-dom';

function PostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>작성자: {post.author}</span>
        <span>👍 {post.likes || 0}</span>
      </div>
    </div>
  );
}

export default PostCard; 