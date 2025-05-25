'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, LogoIcon } from './Icons';
import { PrimaryButton, SecondaryButton, LineButton } from './Button';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

function Navbar(): JSX.Element {
  const { isLoggedIn, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1001] transition-all duration-200
      ${isScrolled 
        ? 'bg-background shadow-sm dark:shadow-black' 
        : 'bg-background'}`}
    >
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-100 mr-4 flex items-center">
              <LogoIcon className="h-6 text-black dark:text-white" />
            </Link>
            <div className="h-[38px] rounded-lg px-4 flex items-center overflow-hidden relative w-[100px]">
              <div 
                className="text-[13px] text-gray-500 dark:text-neutral-300 whitespace-nowrap absolute left-0 flex"
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
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-[38px] w-[38px] border border-gray-300 dark:border-neutral-700 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-gray-700 dark:text-neutral-400" />
                </button>
                
                {/* 유저 메뉴 드롭다운 - 배경색 약간만 밝게 수정 */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-100 dark:bg-neutral-850 rounded-lg shadow-lg py-1 z-[1000] animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">다크 모드</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDarkMode();
                        }} 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                        aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                    <Link 
                      href="/mypage" 
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                    >
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-neutral-700"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <LineButton>로그인</LineButton>
              </Link>
            )}
            
            <Link href="/add-post">
              <PrimaryButton>빌런 제보</PrimaryButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 애니메이션을 위한 CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}

export default Navbar; 