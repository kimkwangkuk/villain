'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';
import { googleLogin } from '../api/firebase';
import { User as FirebaseUser } from 'firebase/auth';

// 사용자 타입 정의
export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// 인증 컨텍스트 타입 정의
export interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// useAuth hook 추가
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 감지
    const unsubscribe = authService.onAuthStateChange((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');  // user가 없으면 localStorage도 클리어
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // login 함수 추가
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await authService.login(email, password);
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      };
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return userData;
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
  const googleLoginHandler = async () => {
    try {
      console.log('AuthContext: Google 로그인 시도');
      const firebaseUser = await googleLogin();
      
      // UID 값 로깅으로 확인
      console.log('AuthContext: Google 로그인 성공, UID:', firebaseUser.uid);
      
      // 사용자 정보로 상태 업데이트
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
      
      // 상태 업데이트 및 로컬 스토리지 저장
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      
      return userData;
    } catch (error) {
      console.error('AuthContext: Google 로그인 실패:', error);
      // 상세 오류 추적
      if (error instanceof Error) {
        console.error('AuthContext: 오류 메시지:', error.message);
        console.error('AuthContext: 오류 스택:', error.stack);
      }
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
        login,
        logout,
        googleLogin: googleLoginHandler
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 