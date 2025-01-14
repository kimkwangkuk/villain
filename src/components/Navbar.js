import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
                <button 
                  className="hover:text-gray-600"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
                <span className="text-gray-800">
                  {user?.username}님
                </span>
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
            {isLoggedIn && (
              <Link 
                to="/posts/new" 
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                글쓰기
              </Link>
            )}
            {isLoggedIn && (
              <Link 
                to="/notifications" 
                className="relative p-2 text-gray-600 hover:text-gray-800"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 