// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: "villain-5f05a.firebaseapp.com",
  projectId: "villain-5f05a",
  storageBucket: "villain-5f05a.firebasestorage.app",
  messagingSenderId: "579679958637",
  appId: "1:579679958637:web:38705cebd28d47fc803164",
  measurementId: "G-0MLWMN815Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

// 브라우저 환경에서만 analytics 초기화
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.error('Analytics initialization failed:', e);
  }
}

// Initialize Services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 개발 환경에서만 에뮬레이터 연결
if (process.env.NODE_ENV === 'development') {
  // 에뮬레이터가 실행 중인 경우에만 연결
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Firebase 에뮬레이터에 연결되었습니다');
  } catch (error) {
    console.warn('Firebase 에뮬레이터 연결 실패:', error);
  }
}

// Google Provider 인스턴스 생성
const googleProvider = new GoogleAuthProvider();

// Google 로그인 함수
export const signInWithGoogle = async () => {
  try {
    console.log('Google 로그인 시도 중...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google 로그인 성공:', user.displayName);
    
    // Firestore에 사용자 정보 저장 (선택사항)
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        username: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    // 자세한 오류 정보 추가
    if (error.code) {
      console.error('오류 코드:', error.code);
    }
    if (error.message) {
      console.error('오류 메시지:', error.message);
    }
    throw error;
  }
};

export { db, auth, storage };

export default app;