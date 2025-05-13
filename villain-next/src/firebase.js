// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Next.js 환경에서 디버깅을 위한 코드
if (typeof window !== 'undefined') {
  console.log('Firebase 초기화 - 브라우저 환경');
  console.log('현재 환경:', process.env.NODE_ENV);
  console.log('현재 URL:', window.location.href);
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: "villain.today",  // 원본 값으로 복원
  projectId: "villain-5f05a",
  storageBucket: "villain-5f05a.firebasestorage.app",
  messagingSenderId: "579679958637",
  appId: "1:579679958637:web:38705cebd28d47fc803164",
  measurementId: "G-0MLWMN815Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 브라우저 환경에서만 analytics 초기화
let analytics = null;
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
  try {
    // 원본 설정으로 포트 복원 (8080 포트가 이미 사용 중이므로 8081로 변경)
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Storage 에뮬레이터 추가
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('Firebase 에뮬레이터에 연결되었습니다');
  } catch (error) {
    console.warn('Firebase 에뮬레이터 연결 실패:', error);
  }
}

// Google Provider 인스턴스 생성
const googleProvider = new GoogleAuthProvider();

// 원본 코드 기반 Google 로그인 함수
export const signInWithGoogle = async () => {
  try {
    console.log('Google 로그인 시도');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google 로그인 성공');
    
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
      console.log('사용자 정보 저장 완료');
    }
    
    return user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

export { db, auth, storage };

export default app; 