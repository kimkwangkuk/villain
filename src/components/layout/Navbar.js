import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            빌런 스토리
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-gray-300">
              홈
            </Link>
            {isLoggedIn ? (
              <>
                <button 
                  className="hover:text-gray-300"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
                <span className="text-gray-300">
                  {user?.username}님
                </span>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-gray-300"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
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