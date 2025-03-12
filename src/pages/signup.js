import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signup, login } from '../api/firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { generateRandomUsername } from '../scripts/usernameWords';
import { LogoIcon, StarIcon, EmailIcon, LockIcon } from '../components/Icons';
import { LineButton } from '../components/Button';

// 애니메이션 관련 코드 제거
// const marqueeStyle = {
//   animation: 'marquee 15s linear infinite',
//   whiteSpace: 'nowrap',
//   display: 'inline-block'
// };

// 키프레임 애니메이션 정의 제거
// const keyframes = `
// @keyframes marquee {
//   0% {
//     transform: translateX(100%);
//   }
//   100% {
//     transform: translateX(-100%);
//   }
// }
// `;

function AuthPage() {
  const { googleLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  // 스케일 관련 코드 제거
  
  // 회원가입 모드인 경우 내부적으로 랜덤 닉네임을 생성합니다.
  const [formData, setFormData] = useState(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    username: location.pathname === '/login' ? '' : generateRandomUsername()
  }));
  const [error, setError] = useState('');

  // CSS 애니메이션을 위한 스타일 태그 추가 제거
  // useEffect(() => {
  //   const style = document.createElement('style');
  //   style.innerHTML = keyframes;
  //   document.head.appendChild(style);
    
  //   return () => {
  //     document.head.removeChild(style);
  //   };
  // }, []);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: location.pathname === '/login' ? '' : generateRandomUsername()
    });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getErrorMessage = (error) => {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일 주소입니다.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 주소입니다.';
      case 'auth/operation-not-allowed':
        return '이메일/비밀번호 로그인이 비활성화되어 있습니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상이어야 합니다.';
      case 'auth/user-disabled':
        return '해당 사용자 계정이 비활성화되었습니다.';
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다.';
      case 'auth/wrong-password':
        return '잘못된 비밀번호입니다.';
      case 'auth/too-many-requests':
        return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
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
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        console.log('로그인 성공');
        navigate(location.state?.from || '/', { replace: true });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }

        const profileImageUrl = await getRandomProfileImage();
        console.log('선택된 프로필 이미지:', profileImageUrl);

        if (!profileImageUrl) {
          console.error('프로필 이미지를 가져오는데 실패했습니다.');
          return;
        }

        const response = await signup({
          email: formData.email,
          password: formData.password,
          // 랜덤으로 생성된 username이 사용됩니다.
          username: formData.username,
          photoURL: profileImageUrl
        });

        console.log('회원가입 응답:', response);
        if (!response.displayName) {
          setError('사용자 이름 설정에 실패했습니다.');
          return;
        }

        if (!response.photoURL) {
          console.error('프로필 이미지 설정 실패');
        }

        alert('회원가입이 완료되었습니다.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('회원가입/로그인 실패:', error);
      setError(getErrorMessage(error));
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: isLogin ? generateRandomUsername() : ''
    });
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      navigate(location.state?.from || '/', { replace: true });
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      setError('Google 로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      {/* 네비게이션 바 제거하고 2분할 레이아웃으로 변경 */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* 왼쪽 섹션: 텍스트 */}
        <div className="w-full md:w-1/2 flex flex-col p-4 pt-20 md:p-12 lg:p-16 bg-white dark:bg-black relative">
          {/* 로고를 왼쪽 상단에 배치 */}
          <div className="absolute top-4 left-4">
            <Link to="/" className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
              <LogoIcon className="h-6 text-[#FF3131] dark:text-[#FF3131]" />
            </Link>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center mt-10 md:mt-0">
            <div className="text-center mb-12 space-y-6 md:space-y-4 w-full px-2 md:px-6 lg:px-10">
              <div className="space-y-6 md:space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-[18px] mb-4">
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
        
        {/* 오른쪽 섹션: 로그인 폼과 버튼들 */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-200 dark:bg-[#0B0B0B]">
          <div className="w-full max-w-md">
            {/* 이메일 로그인 폼 */}
            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
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

              {/* 입력 필드 그룹화 */}
              <div className="flex justify-center">
                <div className="w-3/4 bg-gray-100 dark:bg-black rounded-lg overflow-hidden">
                  <div className="border-b border-gray-300 dark:border-gray-800">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EmailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="가입하실 이메일을 입력해주세요."
                        className="block w-full pl-10 pr-3 py-3 border-0 bg-gray-100 dark:bg-black text-gray-400 dark:text-gray-500 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="비밀번호를 입력해주세요."
                        className="block w-full pl-10 pr-3 py-3 border-0 bg-gray-100 dark:bg-black text-gray-400 dark:text-gray-500 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {!isLogin && (
                    <div className="border-t border-gray-300 dark:border-gray-800">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          placeholder="비밀번호 확인"
                          className="block w-full pl-10 pr-3 py-3 border-0 bg-gray-100 dark:bg-black text-gray-400 dark:text-gray-500 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-3/4 flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors border border-gray-800 dark:border-gray-200"
                >
                  {isLogin ? '로그인' : '회원가입'}
                </button>
              </div>
            </form>
            
            {/* 구분선 */}
            <div className="relative my-6 flex justify-center">
              <div className="w-3/4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-200 dark:bg-[#0B0B0B] text-gray-500 dark:text-gray-400">또는</span>
                </div>
              </div>
            </div>
            
            {/* 소셜 로그인 버튼 - 가로 너비 줄임 */}
            <div className="space-y-4 mb-6 flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="w-3/4 flex justify-center items-center px-4 py-3 rounded-md shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border border-gray-800 dark:border-gray-200"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" 
                />
                Google로 계속하기
              </button>
            </div>

            <div className="mt-6 text-center">
              <span className="text-gray-500 dark:text-gray-400">
                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                <button onClick={toggleForm} className="font-medium text-blue-600 hover:text-blue-500">
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage; 