import { db, auth, storage } from '@/firebase';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  User,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

// 랜덤 사용자 이름 생성 함수
const generateRandomUsername = () => {
  const adjectives = ['행복한', '즐거운', '신나는', '멋진', '훌륭한', '대단한', '귀여운', '친절한', '똑똑한', '현명한'];
  const nouns = ['고양이', '강아지', '토끼', '여우', '사자', '호랑이', '판다', '코알라', '기린', '코끼리'];
  const randomNum = Math.floor(Math.random() * 1000);
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
};

// 랜덤 프로필 이미지 가져오기
const getRandomProfileImage = async () => {
  try {
    console.log('랜덤 프로필 이미지 가져오기 시도');
    const imageNumber = Math.floor(Math.random() * 2) + 1; // woman1.webp 또는 woman2.webp
    const imageRef = ref(storage, `profile_images/woman${imageNumber}.webp`);
    
    const url = await getDownloadURL(imageRef);
    console.log('프로필 이미지 URL 가져오기 성공:', url);
    return url;
  } catch (error) {
    console.error('프로필 이미지 가져오기 실패:', error);
    // 에뮬레이터용 임시 URL 반환
    return 'https://example.com/default-profile.jpg';
  }
};

// Google 로그인 함수
export const googleLogin = async (): Promise<User> => {
  try {
    console.log('API: Google 로그인 시도 중...');
    
    // 개발 환경에서 추가 로깅
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('API: Firebase 환경 -', process.env.NODE_ENV);
      if (typeof window !== 'undefined') {
        console.log('API: 구글 로그인 진행 경로 -', window.location.href);
        console.log('API: 현재 호스트 -', window.location.host);
        console.log('API: 현재 오리진 -', window.location.origin);
        
        // Firebase 도메인 설정 확인
        console.log('API: Firebase authDomain -', auth.app.options.authDomain);
      } else {
        console.log('API: SSR 환경에서 실행 중');
      }
    }
    
    const provider = new GoogleAuthProvider();
    // 로그인 옵션 설정 (사용자 정보 요청)
    provider.addScope('profile');
    provider.addScope('email');
    
    // 명시적으로 팝업 모드 설정
    const result: UserCredential = await signInWithPopup(auth, provider);
    const user: User = result.user;
    
    console.log('API: Google 로그인 성공 -', user.email);
    
    // 랜덤 프로필 이미지 가져오기
    let profileImageUrl = await getRandomProfileImage();
    // null 또는 undefined인 경우 항상 기본 URL 사용
    if (!profileImageUrl) {
      profileImageUrl = 'https://example.com/default-profile.jpg';
    }
    
    // 랜덤 사용자 이름 생성
    const username = generateRandomUsername();
    console.log('생성된 사용자 이름:', username);
    
    // 프로필 업데이트 (이름과 이미지 함께 설정)
    if (user) {
      await updateProfile(user, { 
        displayName: username, 
        photoURL: profileImageUrl 
      });
      console.log('사용자 프로필 업데이트 성공');
    }
    
    // Firestore에 사용자 정보 저장
    console.log('Firestore에 사용자 정보 저장 시도');
    const userRef = doc(db, 'users', user.uid);
    
    // 기존 사용자 확인
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // 새 사용자만 정보 추가
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        username: username,
        photoURL: profileImageUrl,
        createdAt: serverTimestamp(),
        bio: ''
      });
      console.log('Firestore 사용자 정보 저장 성공');
    } else {
      console.log('이미 등록된 사용자입니다');
    }
    
    return user;
  } catch (error: any) {
    console.error('API: Google 로그인 실패 -', error);
    
    // 세부 디버깅 정보
    if (error.code) console.error('API: 오류 코드 -', error.code);
    if (error.message) console.error('API: 오류 메시지 -', error.message);
    
    // redirect_uri_mismatch 문제 자세한 로깅 추가
    if (error.message && error.message.includes('redirect_uri_mismatch')) {
      console.error('API: === 리디렉션 URI 불일치 오류 ===');
      if (typeof window !== 'undefined') {
        console.error('API: 현재 URL:', window.location.href);
        console.error('API: 현재 호스트:', window.location.host);
        console.error('API: 현재 오리진:', window.location.origin);
      }
      console.error('API: 이 오류는 Firebase 콘솔에 등록된 도메인과 현재 사용 중인 도메인이 일치하지 않을 때 발생합니다.');
      console.error('API: Firebase 콘솔(https://console.firebase.google.com/project/villain-5f05a/authentication/settings)에서');
      console.error('API: "승인된 도메인" 목록에 현재 도메인을 추가해주세요.');
      console.error('API: ===================================');
    }
    
    // 오류 코드별 상세 로깅
    if (error.code === 'auth/popup-blocked') {
      console.error('팝업이 차단되었습니다. 브라우저 설정에서 팝업 허용을 확인해주세요.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.error('사용자가 팝업을 닫았습니다.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.error('이전 팝업 요청이 있어 새 요청이 취소되었습니다.');
    } else if (error.code === 'auth/unauthorized-domain') {
      console.error('현재 도메인이 Firebase 콘솔에 등록되지 않았습니다.');
      console.error('Firebase 콘솔에서 "승인된 도메인" 목록에 현재 도메인을 추가해주세요.');
      if (typeof window !== 'undefined') {
        console.error('승인이 필요한 도메인:', window.location.host);
      }
    }
    
    throw error;
  }
}; 