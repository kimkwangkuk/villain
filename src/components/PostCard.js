import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, updateLikes } from '../api/firebase';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

function PostCard({ post }) {
  const navigate = useNavigate();
  const { categoryName, title, content, authorName, createdAt } = post;

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="block bg-white rounded-xl p-6 cursor-pointer min-h-[320px] border border-gray-100
        hover:shadow-[0_15px_30px_-10px_rgba(51,65,85,0.1),0_25px_25px_-15px_rgba(79,70,229,0.1),0_-6px_15px_-10px_rgba(51,65,85,0.08)] 
        hover:scale-[1.02] transition-all duration-200"
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-800 mb-3">
            {categoryName}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
          <p className="text-gray-600 mb-6">{content}</p>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={post.authorPhotoURL || getDefaultProfileImage()}
                alt={`${post.authorName}의 프로필`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getDefaultProfileImage();
                }}
              />
            </div>
            <div className="flex flex-col">
              <span>{authorName}</span>
              <span className="text-xs text-gray-400">
                {getRelativeTime(createdAt?.toDate())}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-400 flex items-center">
              <span className="mr-1">👁️</span>
              {post.viewCount || 0}
            </span>
            <div className="flex items-center space-x-1">
              <span>💬</span>
              <span>{post.commentCount}</span>
            </div>
            <div 
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.preventDefault()}
            >
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <span>{post.isLiked ? '❤️' : '🤍'}</span>
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 