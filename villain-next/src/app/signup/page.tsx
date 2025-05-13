'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { auth } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { LogoIcon } from '@/components/Icons';

// 랜덤 사용자 이름 생성 함수
const generateRandomUsername = () => {
  const adjectives = ['행복한', '즐거운', '신나는', '멋진', '훌륭한', '대단한', '귀여운', '친절한', '똑똑한', '현명한'];
  const nouns = ['고양이', '강아지', '토끼', '여우', '사자', '호랑이', '판다', '코알라', '기린', '코끼리'];
  const randomNum = Math.floor(Math.random() * 1000);
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
};

// 스피너 컴포넌트
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white dark:text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: generateRandomUsername()
  });
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 클라이언트 사이드에서만 작동하는 코드를 useEffect로 처리
  useEffect(() => {
    // 클라이언트 사이드 환경 확인
    if (typeof window !== 'undefined') {
      console.log('회원가입 페이지 마운트 - 클라이언트 사이드');
      console.log('현재 URL:', window.location.href);
      console.log('개발 환경:', process.env.NODE_ENV);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 오류 메시지 가져오기
  const getErrorMessage = (error: any) => {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일 주소입니다. 다른 이메일로 시도하거나 로그인해주세요.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 주소입니다. 올바른 이메일 형식으로 입력해주세요.';
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다. 6자 이상의 더 강력한 비밀번호를 사용해주세요.';
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다. 이메일을 확인하거나 회원가입을 진행해주세요.';
      case 'auth/wrong-password':
        return '잘못된 비밀번호입니다. 비밀번호를 확인하고 다시 시도해주세요.';
      case 'auth/too-many-requests':
        return '너무 많은 로그인 시도가 있었습니다. 보안을 위해 잠시 후 다시 시도해주세요.';
      case 'auth/network-request-failed':
        return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
      case 'auth/popup-blocked':
        return '로그인 팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
      default:
        return `회원가입 중 오류가 발생했습니다 (${errorCode}). 잠시 후 다시 시도하거나 관리자에게 문의해주세요.`;
    }
  };

  // 랜덤 프로필 이미지 가져오기
  const getRandomProfileImage = async () => {
    const storage = getStorage();
    const imageNumber = Math.floor(Math.random() * 2) + 1; // woman1.webp 또는 woman2.webp
    const imageRef = ref(storage, `profile_images/woman${imageNumber}.webp`);
    try {
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('프로필 이미지 가져오기 실패:', error);
      // 기본 이미지 경로 반환
      const defaultImageRef = ref(storage, 'profile_images/default.webp');
      try {
        return await getDownloadURL(defaultImageRef);
      } catch (defaultError) {
        console.error('기본 프로필 이미지 가져오기 실패:', defaultError);
        return null;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      return;
    }

    try {
      // 프로필 이미지 가져오기
      const profileImageUrl = await getRandomProfileImage();
      
      if (!profileImageUrl) {
        setError('프로필 이미지를 가져오는데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        return;
      }

      // Firebase 회원가입
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 사용자 프로필 업데이트
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: formData.username,
          photoURL: profileImageUrl
        });
      }

      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      const errorMessage = getErrorMessage(error);
      setError(`회원가입 실패: ${errorMessage}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('구글 로그인 시도 - 회원가입 페이지');
      console.log('현재 URL:', window.location.href);
      
      // 팝업이 차단되지 않도록 사용자에게 안내
      console.log('잠시 후 로그인 팝업이 열립니다. 팝업 차단을 허용해 주세요.');
      
      // 개발 환경에서 설정 정보 확인
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase 설정 확인 - 현재 환경:', process.env.NODE_ENV);
        console.log('Firebase 인증 상태 확인:', auth.currentUser);
        
        // 에뮬레이터 상태 확인
        console.log('Auth 에뮬레이터 사용 확인:', 
          (auth as any)._delegate?._repo?.emulatorConfig 
            ? '에뮬레이터 사용 중' 
            : '에뮬레이터 미사용');
      }
      
      // 에러 핸들링 개선을 위한 타임아웃 설정
      const loginTimeout = setTimeout(() => {
        console.error('구글 로그인 시간 초과 (10초)');
        setError('로그인 요청이 시간 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        setIsGoogleLoading(false);
      }, 10000);
      
      // 구글 로그인 시도
      const user = await googleLogin();
      
      // 타임아웃 취소
      clearTimeout(loginTimeout);
      
      if (user) {
        console.log('구글 로그인 성공 - 회원가입 페이지');
        console.log('로그인 사용자 정보:', {
          uid: user.uid,
          email: user.email,
          name: user.displayName
        });
        
        // 로그인 성공 후 잠시 로딩 상태 유지 (사용자에게 피드백 제공)
        setTimeout(() => {
          setIsGoogleLoading(false);
          router.push('/home');
        }, 1000); // 1초 지연
      } else {
        setIsGoogleLoading(false);
        throw new Error('로그인은 성공했지만 사용자 정보를 받지 못했습니다.');
      }
    } catch (error: any) {
      setIsGoogleLoading(false);
      console.error('Google 로그인 실패 - 회원가입 페이지:', error);
      
      // 상세 오류 정보 로깅
      if (error.code) console.error('오류 코드:', error.code);
      if (error.message) console.error('오류 메시지:', error.message);
      
      // 도메인 인증 오류 처리
      if (error.code === 'auth/unauthorized-domain') {
        setError('현재 도메인이 Firebase에 등록되지 않았습니다. Firebase 콘솔에서 도메인을 추가해주세요.');
        console.error('Firebase 콘솔에서 승인된 도메인 목록에 현재 도메인(localhost)을 추가해야 합니다.');
        console.error('https://console.firebase.google.com/project/_/authentication/settings 에서 승인된 도메인을 확인해주세요.');
        console.error('에뮬레이터를 사용 중인지 확인하세요. 에뮬레이터 사용 시 도메인 제한이 우회됩니다.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔습니다. 팝업 창을 닫지 말고 로그인을 완료해 주세요.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('브라우저에서 팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해 주세요.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.');
        console.error('로컬호스트와 Firebase 서버 간의 연결에 문제가 있습니다.');
        console.error('CORS 또는 네트워크 문제일 수 있습니다.');
      } else if (error.code === 'auth/internal-error') {
        setError('Firebase 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        console.error('Firebase 내부 오류 - 에뮬레이터 설정을 확인하세요.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('이전 팝업 요청이 취소되었습니다. 다시 시도해 주세요.');
      } else {
        setError(`Google 로그인에 실패했습니다: ${error.code || '알 수 없는 오류'}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <div className="flex flex-col md:flex-row h-screen p-4">
        {/* 왼쪽 섹션: 텍스트 */}
        <div className="w-full md:w-2/3 flex flex-col p-6 md:p-12 lg:p-16 bg-white dark:bg-black relative rounded-2xl shadow-sm mb-4 md:mb-0 md:mr-4">
          {/* 로고를 왼쪽 상단에 배치 */}
          <div className="absolute top-1 left-0">
            <Link href="/home" className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
              <LogoIcon className="h-6 text-black dark:text-white" />
            </Link>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center mt-10 md:mt-0">
            <div className="text-center space-y-6 md:space-y-4 w-full">
              <div className="space-y-6 md:space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-[18px]">
                  빌런 제보 익명 커뮤니티
                </p>
                <h1 className="text-gray-800 dark:text-white text-2xl md:text-3xl lg:text-4xl font-bold" style={{ lineHeight: '1.4' }}>
                  내 일상을 어지럽히는 빌런을 제보하고<br />
                  밝은 세상을 만들어요.
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* 오른쪽 섹션: 회원가입 폼 */}
        <div className="w-full md:w-1/3 flex items-center justify-center p-6 md:p-10 bg-gray-100 dark:bg-[#111111] rounded-2xl shadow-sm">
          <div className="w-full max-w-md">
            {/* 이메일 회원가입 폼 */}
            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 입력 필드 */}
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="이메일을 입력해주세요"
                      className="block w-full px-4 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-800 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-0"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="닉네임"
                      className="block w-full px-4 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-800 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-0"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="비밀번호를 입력해주세요"
                      className="block w-full px-4 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-800 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-0"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="비밀번호를 다시 입력해주세요"
                      className="block w-full px-4 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-800 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-0"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors border border-gray-800 dark:border-gray-200"
                >
                  회원가입
                </button>
              </div>
            </form>
            
            {/* 구분선 */}
            <div className="relative my-6 flex justify-center">
              <div className="w-full relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-100 dark:bg-[#111111] text-gray-500 dark:text-gray-400 text-xs">또는</span>
                </div>
              </div>
            </div>
            
            {/* 소셜 로그인 버튼 */}
            <div className="space-y-4 mb-6 flex justify-center">
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border border-gray-800 dark:border-gray-200"
              >
                {isGoogleLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <img 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      alt="Google" 
                      className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" 
                    />
                    Google로 계속하기
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                  로그인
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 