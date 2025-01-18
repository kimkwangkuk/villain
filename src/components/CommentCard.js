import { PrimaryButton } from './Button';

function CommentCard({ comment, postAuthorId, isCommentInput = false }) {
  const isPostAuthor = comment.userId === postAuthorId;

  return (
    <div>
      {/* 댓글 입력창 - 최상단에만 표시 */}
      {isCommentInput && (
        <div className="mb-4 bg-white rounded-[28px] border border-gray-100">
          <textarea
            placeholder="댓글을 입력해주세요."
            className="w-full h-[180px] resize-none border-none focus:outline-none focus:ring-0 text-gray-400 text-[17px] p-7"
          />
          <div className="px-7 pb-7 flex justify-end">
            <button className="bg-black text-white px-6 py-3 rounded-[14px] text-[15px]">
              등록
            </button>
          </div>
        </div>
      )}

      {/* 댓글 카드 */}
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          {/* 프로필 이미지 */}
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
            {/* 작성자 이름 */}
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900">{comment.author || '익명'}</span>
            </div>
            
            {/* 댓글 텍스트 */}
            <p className="text-gray-700 mb-2">
              {comment.content}
            </p>

            {/* 하단 액션 영역 */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{comment.createdAt?.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
              <button className="hover:text-gray-700">답글</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentCard; 