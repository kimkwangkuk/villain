import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signup, login } from '../api/firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { generateRandomUsername } from '../scripts/usernameWords';
import { LogoIcon, StarIcon } from '../components/Icons';

function AuthPage() {
  const { googleLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  // 회원가입 모드인 경우 내부적으로 랜덤 닉네임을 생성합니다.
  const [formData, setFormData] = useState(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    username: location.pathname === '/login' ? '' : generateRandomUsername()
  }));
  const [error, setError] = useState('');

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
    <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="pt-8 pb-6">
        <Link to="/" className="inline-block">
          <LogoIcon className="h-6 text-black dark:text-white" />
        </Link>
      </div>

      <div className="text-center mb-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          익명 빌런 제보 커뮤니티
        </p>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.4]">
          내 일상을 어지럽히는 빌런을 제보하고<br />
          <span className="inline-flex items-center">
            <StarIcon className="w-8 h-8 mr-1 text-gray-900 dark:text-white" />
            밝은
          </span> 세상을 만들어요.
        </h1>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
        </div>

        <div className="w-full">
          <form className="space-y-4" onSubmit={handleSubmit}>
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md shadow-sm bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-gray-300 focus:border-gray-300 dark:focus:ring-neutral-700 dark:focus:border-neutral-700"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* 사용자 이름 입력 필드 제거됨 - 내부적으로 랜덤으로 생성된 username을 사용합니다. */}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md shadow-sm bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-gray-300 focus:border-gray-300 dark:focus:ring-neutral-700 dark:focus:border-neutral-700"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md shadow-sm bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-gray-300 focus:border-gray-300 dark:focus:ring-neutral-700 dark:focus:border-neutral-700"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-gray-900 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {isLogin ? '로그인' : '회원가입'}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                  {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                  <button onClick={toggleForm} className="font-medium text-blue-600 hover:text-blue-500">
                    {isLogin ? '회원가입' : '로그인'}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-neutral-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-neutral-900"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-5 h-5 mr-2" 
                />
                Google로 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage; 