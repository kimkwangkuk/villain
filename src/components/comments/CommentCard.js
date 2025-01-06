function CommentCard({ comment }) {
  return (
    <div className="border-b pb-3">
      <p className="text-gray-700 mb-2">{comment.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>작성자: {comment.userId}</span>
        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default CommentCard; 