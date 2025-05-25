// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// 개발 환경 여부 확인
const isDevelopment = process.env.NODE_ENV === 'development';

// Next.js 환경에서 디버깅을 위한 코드
if (typeof window !== 'undefined') {
  console.log('Firebase 초기화 - 브라우저 환경');
  console.log('현재 환경:', process.env.NODE_ENV);
  console.log('현재 URL:', window.location.href);
  console.log('현재 호스트:', window.location.host);
  console.log('현재 오리진:', window.location.origin);
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: isDevelopment ? "villain-5f05a.firebaseapp.com" : "villain.today",  // 환경에 따라 다른 authDomain 사용
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

// 🔴 개발 환경에서는 항상 에뮬레이터 사용
const useEmulators = isDevelopment;

// 🔴 에뮬레이터에 직접 연결 (더 간단한 방식)
if (useEmulators && typeof window !== 'undefined') {
  console.log('🔥 Firebase 에뮬레이터에 직접 연결 시도...');
  
  try {
    // Auth 에뮬레이터 직접 연결
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: false });
    console.log('✅ Auth 에뮬레이터 연결 완료');
    
    try {
      // Firestore 에뮬레이터 직접 연결
      connectFirestoreEmulator(db, 'localhost', 8081);
      console.log('✅ Firestore 에뮬레이터 연결 완료');
    } catch (error) {
      console.error('❌ Firestore 에뮬레이터 연결 실패:', error);
    }
    
    try {
      // Storage 에뮬레이터 직접 연결
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('✅ Storage 에뮬레이터 연결 완료');
    } catch (error) {
      console.error('❌ Storage 에뮬레이터 연결 실패:', error);
    }
    
    console.log('🎉 에뮬레이터 연결 처리 완료!');
  } catch (error) {
    console.error('❌ Auth 에뮬레이터 연결 실패:', error);
  }
}

// Google Provider 인스턴스 생성
const googleProvider = new GoogleAuthProvider();

// 개발 환경에서 추가 로깅 설정
if (isDevelopment && typeof window !== 'undefined') {
  console.log('=== Firebase 구성 정보(개발 환경) ===');
  console.log('- authDomain:', firebaseConfig.authDomain);
  console.log('- 현재 URL:', window.location.href);
  console.log('==============================');

  // 도메인 확인 및 사용자 안내
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' && 
      !window.location.hostname.includes(firebaseConfig.authDomain)) {
    console.warn('현재 도메인이 Firebase에 등록된 도메인과 다릅니다!');
    console.warn(`현재 사용 중인 도메인: ${window.location.hostname}`);
    console.warn(`Firebase에 등록된 도메인: ${firebaseConfig.authDomain}`);
    console.warn('Google 로그인이 작동하지 않을 수 있습니다.');
  }
}

// 🔴 수정된 Google 로그인 함수
export const signInWithGoogle = async () => {
  try {
    console.log('🔄 Google 로그인 시도');
    
    // 개발 환경에서 추가 로깅
    if (isDevelopment && typeof window !== 'undefined') {
      console.log('🔍 로그인 시도 정보:');
      console.log('- 현재 URL:', window.location.href);
      console.log('- 현재 오리진:', window.location.origin);
      console.log('- authDomain:', firebaseConfig.authDomain);
      
      // 에뮬레이터 사용 중인지 확인
      const isUsingEmulator = auth._config?.emulator?.url ? true : false;
      console.log('🔥 에뮬레이터 사용 중:', isUsingEmulator);
      
      // 에뮬레이터 미연결 시 연결 시도
      if (!isUsingEmulator && useEmulators) {
        console.log('🔄 에뮬레이터에 연결 시도...');
        try {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
          console.log('✅ 에뮬레이터 연결 완료');
        } catch (error) {
          console.error('❌ 에뮬레이터 연결 실패:', error);
        }
      }
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('✅ Google 로그인 성공');
    
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
      console.log('✅ 사용자 정보 저장 완료');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Google 로그인 실패:', error);
    
    // redirect_uri_mismatch 오류 자세한 로깅
    if (error.code === 'auth/unauthorized-domain' || 
        (error.message && error.message.includes('redirect_uri_mismatch'))) {
      console.error('=== 도메인 인증 오류 상세 정보 ===');
      console.error('현재 사용 중인 도메인이 Firebase 콘솔에 등록되지 않았습니다.');
      if (typeof window !== 'undefined') {
        console.error('현재 URL:', window.location.href);
        console.error('현재 호스트:', window.location.host);
        console.error('현재 오리진:', window.location.origin);
      }
      console.error('Firebase 콘솔 URL: https://console.firebase.google.com/project/villain-5f05a/authentication/settings');
      console.error('Firebase 콘솔에서 "승인된 도메인" 목록에 현재 도메인을 추가해주세요.');
      console.error('================================');
    }
    
    throw error;
  }
};

export { db, auth, storage };

export default app; 