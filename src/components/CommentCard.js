import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
      <div className="rounded-lg py-0">
        <div className="flex items-start space-x-3">
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isPostAuthor ? 'bg-blue-100' : 'bg-gray-300'}`}>
              <span className={`text-sm ${isPostAuthor ? 'text-blue-600' : 'text-gray-600'}`}>
                {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          <div className="flex-grow">
            {/* 작성자 정보를 가로로 배치하도록 수정 */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-gray-900">{comment.authorName || '익명'}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {comment.createdAt?.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* 댓글 텍스트 */}
            <div className="pl-0">
              <p className="text-gray-700">
                {comment.content}
              </p>
              <div className="mt-2">
                <button className="text-gray-700 text-sm">답글</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentCard; 