'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Auth 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, username?: string) => Promise<User>;
  signOut: () => Promise<void>;
  getUserData: (userId: string) => Promise<any>;
}

// Auth 컨텍스트 생성
const AuthContext = createContext<AuthContextType | null>(null);

// Auth 제공자 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 사용자 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 로그인 함수
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  };

  // 회원가입 함수
  const signUp = async (email: string, password: string, username?: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자 프로필 데이터 저장
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username || user.email?.split('@')[0] || '익명 사용자',
        createdAt: new Date(),
      });

      return user;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  // 사용자 데이터 가져오기
  const getUserData = async (userId: string): Promise<any> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('사용자 데이터 가져오기 오류:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 사용자 정의 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  return context;
} 