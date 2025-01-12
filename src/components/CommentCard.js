function CommentCard({ comment, postAuthorId }) {
  const isPostAuthor = comment.userId === postAuthorId;

  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {/* 사용자 프로필 아바타 */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${isPostAuthor ? 'bg-blue-100' : 'bg-gray-300'}`}>
            <span className={`text-sm ${isPostAuthor ? 'text-blue-600' : 'text-gray-600'}`}>
              {comment.author?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        {/* 댓글 내용 */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{comment.author || '익명'}</span>
              {isPostAuthor && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                  작성자
                </span>
              )}
              <span className="text-sm text-gray-500 ml-2">
                {comment.createdAt?.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommentCard; 