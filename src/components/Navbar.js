import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  return (
    <nav className="bg-white text-black w-full">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            빌런
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-gray-600">
              홈
            </Link>
            <Link to="/about" className="hover:text-gray-600">
              빌런 소개
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/mypage" 
                  className="hover:text-gray-600"
                >
                  마이페이지
                </Link>
                <span className="text-gray-800">
                  {user?.username}님
                </span>
                <Link 
                  to="/posts/new" 
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  빌런 제보
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-gray-600"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 