import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { UserIcon } from './Icons';
import { PrimaryButton, SecondaryButton, LineButton } from './Button';

function Navbar() {
  const { isLoggedIn } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200
      ${isScrolled 
        ? 'bg-white shadow-sm' 
        : 'bg-white'}`}
    >
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-gray-900 mr-4">
              빌런
            </Link>
            <div className="h-[38px] bg-gray-100 rounded-lg px-4 flex items-center overflow-hidden relative w-[100px]">
              <div 
                className="text-[13px] text-gray-500 whitespace-nowrap absolute left-0 flex"
                style={{
                  animation: 'marquee 25s linear infinite',
                  paddingLeft: '100%' // 오른쪽에서 시작
                }}
              >
                <span className="mx-2">빌런 제보 익명 커뮤니티</span>
                <span className="mx-2">빌런 제보 익명 커뮤니티</span>
                <span className="mx-2">빌런 제보 익명 커뮤니티</span>
                <span className="mx-2">빌런 제보 익명 커뮤니티</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <Link to="/mypage" className="hover:text-gray-600 mr-2">
                <UserIcon />
              </Link>
            )}
            
            <Link to="/posts/new">
              <PrimaryButton>빌런 제보</PrimaryButton>
            </Link>

            {!isLoggedIn && (
              <Link to="/login">
                <LineButton>로그인</LineButton>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 애니메이션을 위한 CSS */}
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar; 