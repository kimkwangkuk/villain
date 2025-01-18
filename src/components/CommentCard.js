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
            className="w-full h-[180px] resize-none border-none focus:outline-none focus:ring-0 text-gray-400 text-[15px] p-7"
          />
          <div className="px-7 pb-7 flex justify-end">
            <button className="bg-black text-white px-6 py-3 rounded-[14px] text-[15px]">
              등록
            </button>
          </div>
        </div>
      )}

      {/* 댓글 카드 */}
      <div className="rounded-lg">
        {/* 프로필 정보 그룹 */}
        <div className="flex items-center space-x-2 mb-3">
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center
              ${isPostAuthor ? 'bg-blue-100' : 'bg-gray-300'}`}>
              <span className={`text-sm ${isPostAuthor ? 'text-blue-600' : 'text-gray-600'}`}>
                {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>

          {/* 작성자 정보 */}
          <div className="flex items-center space-x-1">
            <span className="text-[13px] font-semibold text-gray-900">{comment.authorName || '익명'}</span>
            <span className="text-[13px] text-gray-300">•</span>
            <span className="text-[13px] text-gray-400">
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
            
        {/* 댓글 내용 */}
        <div className="border-b border-gray-100">
          <div className="pb-4">
            <p className="text-sm text-gray-700">
              {comment.content}
            </p>
            <div className="mt-2">
              <button className="text-gray-700 text-sm">답글</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentCard; 