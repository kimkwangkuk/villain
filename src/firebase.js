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
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: isDevelopment ? "villain-5f05a.firebaseapp.com" : "villain.today",  // 개발 환경에서는 Firebase 앱 도메인 사용
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

// 에뮬레이터 사용 여부 (개발 환경에서 활성화)
let useEmulators = isDevelopment;

// 에뮬레이터 연결 여부를 확인하기 위한 함수
const checkEmulatorConnection = (port, serviceName) => {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`${serviceName} 에뮬레이터 연결 실패 (타임아웃)`);
      resolve(false);
    }, 3000); // 타임아웃 시간 증가

    fetch(`http://localhost:${port}/${serviceName.toLowerCase()}`, { 
      signal,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
      .then((response) => {
        clearTimeout(timeoutId);
        console.log(`${serviceName} 에뮬레이터 연결 확인 성공: ${response.status}`);
        resolve(true);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.warn(`${serviceName} 에뮬레이터 연결 확인 실패:`, error.message);
        resolve(false);
      });
  });
};

// 개발 환경에서만 에뮬레이터 연결
if (isDevelopment) {
  try {
    console.log('Firebase 에뮬레이터 연결 시도 - process.env.NODE_ENV:', process.env.NODE_ENV);
    
    // 에뮬레이터 연결 여부를 저장할 변수
    let emulatorConnected = false;
    
    // 에뮬레이터 연결 함수
    const connectEmulators = async () => {
      // 개발 환경에서 에뮬레이터 사용이 활성화된 경우에만 실행
      // 나중에 로컬 스토리지나 환경 변수로 제어할 수 있음
      if (!useEmulators) {
        console.log('에뮬레이터 사용이 비활성화되어 있습니다.');
        return;
      }

      // Firestore 에뮬레이터 연결 시도
      try {
        console.log('Firestore 에뮬레이터 연결 시도 (localhost:8081)');
        const firestoreEmulatorAvailable = await checkEmulatorConnection(8081, 'Firestore');
        if (firestoreEmulatorAvailable) {
          connectFirestoreEmulator(db, 'localhost', 8081);
          console.log('Firestore 에뮬레이터 연결 성공');
        }
      } catch (error) {
        console.warn('Firestore 에뮬레이터 연결 실패:', error);
      }
      
      // Auth 에뮬레이터 연결 시도
      try {
        console.log('Auth 에뮬레이터 연결 시도 (localhost:9099)');
        const authEmulatorAvailable = await checkEmulatorConnection(9099, 'Auth');
        if (authEmulatorAvailable) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
          console.log('Auth 에뮬레이터 연결 성공');
        }
      } catch (error) {
        console.warn('Auth 에뮬레이터 연결 실패:', error);
      }
      
      // Storage 에뮬레이터 연결 시도
      try {
        console.log('Storage 에뮬레이터 연결 시도 (localhost:9199)');
        const storageEmulatorAvailable = await checkEmulatorConnection(9199, 'Storage');
        if (storageEmulatorAvailable) {
          // Storage 에뮬레이터 연결 전 버킷 설정 확인
          console.log('Storage 버킷 설정:', storage.app.options.storageBucket);
          
          connectStorageEmulator(storage, 'localhost', 9199);
          console.log('Storage 에뮬레이터 연결 성공');
          
          // 에뮬레이터 URL 패턴 로깅
          const testRef = storage.ref('test.jpg');
          console.log('에뮬레이터 Storage 참조 URL:', testRef.toString());
          
          emulatorConnected = true;
        }
      } catch (error) {
        console.error('Storage 에뮬레이터 연결 실패:', error);
      }
      
      // 에뮬레이터 연결 성공 여부 로그
      console.log('Firebase 에뮬레이터 연결 시도 완료');
    };
    
    // 개발 환경에서만 동기식으로 에뮬레이터 연결 시도
    if (typeof window !== 'undefined') {
      // 브라우저 환경에서는 페이지 로드 후 비동기적으로 에뮬레이터 연결 시도
      window.addEventListener('load', () => {
        connectEmulators().then(() => {
          console.log('에뮬레이터 연결 시도 완료');
        });
      });
    } else {
      // 서버 사이드에서는 에뮬레이터를 연결하지 않음
      console.log('서버 사이드 렌더링 - 에뮬레이터 연결 건너뜀');
    }
    
    // 에뮬레이터 연결 실패 시 실제 Firebase 서비스 사용
    if (!emulatorConnected) {
      console.warn('에뮬레이터 연결이 실패했거나 비활성화되어 있습니다.');
      console.warn('실제 Firebase 서비스를 사용합니다. 테스트 환경에서는 주의하세요!');
    }
  } catch (error) {
    console.error('Firebase 에뮬레이터 연결 설정 중 오류:', error);
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