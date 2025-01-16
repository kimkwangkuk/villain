import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signup, login } from '../api/firebase';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');

  // 로그인 성공 후 이전 페이지로 돌아가기 위한 처리
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // 로그인 처리
        await login(formData.email, formData.password);
        // 이전 페이지로 돌아가기
        navigate(from, { replace: true });
      } else {
        // 회원가입 처리
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }

        const response = await signup({
          email: formData.email,
          password: formData.password,
          username: formData.username
        });

        if (!response.displayName) {
          setError('사용자 이름 설정에 실패했습니다.');
          return;
        }

        alert('회원가입이 완료되었습니다.');
        setIsLogin(true); // 회원가입 후 로그인 폼으로 전환
      }
    } catch (error) {
      console.error(isLogin ? '로그인 실패:' : '회원가입 실패:', error);
      setError(error.message || (isLogin ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 bg-white">
        <div className="pt-8 pb-14">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
              빌런
            </h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
          </div>

          <div className="w-full">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    사용자 이름
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={!isLogin}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required={!isLogin}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLogin ? '로그인' : '회원가입'}
                </button>
              </div>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                    <button
                      onClick={toggleForm}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {isLogin ? '회원가입' : '로그인'}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white p-8">
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-bold mb-4">We move 10x faster than our peers</h2>
              <p className="text-lg">and stay consistent. While they're bogged down with design debt, we're releasing new features.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage; 