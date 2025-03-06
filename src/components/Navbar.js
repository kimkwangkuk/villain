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
          <Link to="/" className="text-2xl font-bold hover:text-gray-900">
            빌런
          </Link>

          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <Link to="/mypage" className="hover:text-gray-600">
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
    </nav>
  );
}

export default Navbar; 