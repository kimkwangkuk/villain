import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';
import { signInWithGoogle } from '../firebase';

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
    // Firebase 인증 상태 감지
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoggedIn(!!user);  // user 객체의 존재 여부로만 판단
      setLoading(false);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        localStorage.removeItem('isLoggedIn');  // user가 없으면 localStorage도 클리어
      }
    });

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

  // Google 로그인 함수
  const googleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      // 로그인 성공 처리
      return user;
    } catch (error) {
      console.error('Google 로그인 실패:', error);
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
        logout,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 