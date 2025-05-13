'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 인증 컨텍스트 생성
const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  isLoading: true
});

// 인증 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  const value = {
    isLoggedIn: !!user,
    user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트를 사용하기 위한 훅
export function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;