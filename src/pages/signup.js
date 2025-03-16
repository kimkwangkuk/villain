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
        return '이미 사용 중인 이메일 주소입니다. 다른 이메일로 시도하거나 로그인해주세요.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 주소입니다. 올바른 이메일 형식으로 입력해주세요.';
      case 'auth/operation-not-allowed':
        return '이메일/비밀번호 로그인이 현재 비활성화되어 있습니다. 관리자에게 문의해주세요.';
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다. 6자 이상의 더 강력한 비밀번호를 사용해주세요.';
      case 'auth/user-disabled':
        return '해당 사용자 계정이 비활성화되었습니다. 관리자에게 문의해주세요.';
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
      case 'auth/popup-closed-by-user':
        return '로그인 팝업이 닫혔습니다. 팝업을 닫지 말고 로그인을 완료해주세요.';
      case 'auth/unauthorized-domain':
        return '현재 도메인이 인증되지 않았습니다. 관리자에게 문의해주세요.';
      case 'auth/invalid-credential':
        return '제공된 인증 정보가 잘못되었습니다. 이메일과 비밀번호를 확인해주세요.';
      case 'auth/account-exists-with-different-credential':
        return '이 이메일은 다른 로그인 방식으로 이미 가입되어 있습니다. 다른 로그인 방법을 시도해보세요.';
      case 'auth/requires-recent-login':
        return '보안상의 이유로 재로그인이 필요합니다. 로그아웃 후 다시 로그인해주세요.';
      case 'auth/user-token-expired':
        return '인증 세션이 만료되었습니다. 다시 로그인해주세요.';
      case 'auth/web-storage-unsupported':
        return '이 브라우저는 웹 스토리지를 지원하지 않습니다. 다른 브라우저로 시도해주세요.';
      case 'auth/invalid-verification-code':
        return '잘못된 인증 코드입니다. 올바른 코드를 입력해주세요.';
      case 'auth/invalid-verification-id':
        return '잘못된 인증 ID입니다. 처음부터 다시 시도해주세요.';
      case 'auth/missing-verification-code':
        return '인증 코드가 누락되었습니다. 코드를 입력해주세요.';
      case 'auth/missing-verification-id':
        return '인증 ID가 누락되었습니다. 처음부터 다시 시도해주세요.';
      case 'auth/quota-exceeded':
        return '서비스 할당량이 초과되었습니다. 나중에 다시 시도해주세요.';
      default:
        return `회원가입/로그인 중 오류가 발생했습니다 (${errorCode}). 잠시 후 다시 시도하거나 관리자에게 문의해주세요.`;
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
        try {
          await login(formData.email, formData.password);
          console.log('로그인 성공');
          navigate(location.state?.from || '/', { replace: true });
        } catch (loginError) {
          console.error('로그인 실패 상세:', loginError);
          // 더 자세한 오류 메시지 표시
          const errorMessage = getErrorMessage(loginError);
          setError(`로그인 실패: ${errorMessage}`);
          return;
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
          return;
        }

        // 디버깅을 위한 로그 추가
        console.log('회원가입 시도:', { 
          email: formData.email
        });

        const profileImageUrl = await getRandomProfileImage();
        console.log('선택된 프로필 이미지:', profileImageUrl);

        if (!profileImageUrl) {
          console.error('프로필 이미지를 가져오는데 실패했습니다.');
          setError('프로필 이미지를 가져오는데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
          return;
        }

        try {
          console.log('signup 함수 호출 전');
          const response = await signup({
            email: formData.email,
            password: formData.password,
            photoURL: profileImageUrl
          });
          console.log('signup 함수 호출 후');

          console.log('회원가입 응답:', response);
          
          if (!response) {
            setError('회원가입 응답이 없습니다. 잠시 후 다시 시도해주세요.');
            return;
          }

          if (!response.displayName) {
            console.warn('사용자 이름이 즉시 설정되지 않았습니다. 이는 정상적인 현상일 수 있습니다.');
          }

          if (!response.photoURL) {
            console.warn('프로필 이미지가 즉시 설정되지 않았습니다. 이는 정상적인 현상일 수 있습니다.');
          }

          alert('회원가입이 완료되었습니다.');
          
          // 회원가입 후 자동 로그인 처리
          console.log('회원가입 후 자동 로그인 시도');
          // 이미 Firebase Auth에 로그인된 상태이므로 추가 로그인 필요 없음
          // 단, 상태 업데이트는 필요
          
          // 로그인 상태로 UI 변경
          setIsLogin(true);
          
          // 홈페이지로 이동
          navigate('/', { replace: true });
        } catch (signupError) {
          console.error('회원가입 함수 내부 오류:', signupError);
          const errorMessage = getErrorMessage(signupError);
          setError(`회원가입 실패: ${errorMessage}`);
          return;
        }
      }
    } catch (error) {
      console.error('회원가입/로그인 실패:', error);
      // 더 자세한 오류 메시지 표시
      const errorMessage = getErrorMessage(error);
      setError(`처리 중 오류 발생: ${errorMessage}`);
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
      console.log('구글 로그인 시도');
      await googleLogin();
      console.log('구글 로그인 성공');
      navigate(location.state?.from || '/', { replace: true });
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      
      // 도메인 인증 오류 처리
      if (error.code === 'auth/unauthorized-domain') {
        setError('현재 도메인이 Firebase에 등록되지 않았습니다. Firebase 콘솔에서 도메인을 추가해주세요.');
      } else {
        // 더 자세한 오류 메시지 표시
        setError(`Google 로그인에 실패했습니다: ${error.code} - ${error.message || '알 수 없는 오류'}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      {/* 네비게이션 바 제거하고 2분할 레이아웃으로 변경 */}
      <div className="flex flex-col md:flex-row h-screen p-4">
        {/* 왼쪽 섹션: 텍스트 - 너비 증가 */}
        <div className="w-full md:w-2/3 flex flex-col p-6 md:p-12 lg:p-16 bg-white dark:bg-black relative rounded-2xl shadow-sm mb-4 md:mb-0 md:mr-4">
          {/* 로고를 왼쪽 상단에 배치 */}
          <div className="absolute top-1 left-0">
            <Link to="/" className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
              <LogoIcon className="h-6 text-black dark:text-white" />
            </Link>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center mt-10 md:mt-0">
            <div className="text-center space-y-6 md:space-y-4 w-full">
              <div className="space-y-6 md:space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-[18px] ">
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
        
        {/* 오른쪽 섹션: 로그인 폼과 버튼들 - 너비 감소 및 배경색 밝게 */}
        <div className="w-full md:w-1/3 flex items-center justify-center p-6 md:p-10 bg-gray-100 dark:bg-[#111111] rounded-2xl shadow-sm">
          <div className="w-full max-w-md">
            {/* 이메일 로그인 폼 */}
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

              {/* 입력 필드 - 기본 디자인으로 변경 */}
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EmailIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="이메일을 입력해주세요"
                      className="block w-full pl-10 pr-3 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="비밀번호를 입력해주세요"
                      className="block w-full pl-10 pr-3 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {!isLogin && (
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="비밀번호를 다시 입력해주세요"
                        className="block w-full pl-10 pr-3 py-2 border-0 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm text-gray-900 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-0"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors border border-gray-800 dark:border-gray-200"
                >
                  {isLogin ? '로그인' : '회원가입'}
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
                  <span className="px-2 bg-gray-100 dark:bg-[#111111] text-gray-500 dark:text-gray-400">또는</span>
                </div>
              </div>
            </div>
            
            {/* 소셜 로그인 버튼 */}
            <div className="space-y-4 mb-6 flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg shadow-sm text-sm font-medium text-white dark:text-gray-800 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border border-gray-800 dark:border-gray-200"
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                <button onClick={toggleForm} className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
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