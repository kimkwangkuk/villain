import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

// useAuth hook 추가
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 저장된 로그인 상태 확인
    const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
    
    // Firebase 인증 상태 감지
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoggedIn(!!user);
      setLoading(false);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  // login 함수 추가
  const login = async (email, password) => {
    try {
      const userCredential = await authService.login(email, password);
      setUser(userCredential.user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return userCredential.user;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  // logout 함수 추가
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  // 로딩 중일 때
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        setIsLoggedIn, 
        user, 
        setUser,
        login,  // login 함수 추가
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 