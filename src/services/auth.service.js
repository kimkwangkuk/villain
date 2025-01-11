import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const authService = {
  // 로그인
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // 회원가입
  signup: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    return await signOut(auth);
  },

  // 현재 사용자 가져오기
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // 인증 상태 변경 감지
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
}; 