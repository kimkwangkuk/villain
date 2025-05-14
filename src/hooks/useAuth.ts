import { useAuth as useAuthFromContext } from '../context/AuthContext';

// 사용자 타입 정의
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

// 인증 컨텍스트 타입 정의
export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<User>;
}

export { useAuth as default, useAuth } from '../context/AuthContext'; 