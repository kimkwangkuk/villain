const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase 클라이언트 SDK 설정 (라이브 프로젝트의 설정 값을 사용하세요)
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: "villain-5f05a.firebaseapp.com",
  projectId: "villain-5f05a",
  storageBucket: "villain-5f05a.firebasestorage.app",
  messagingSenderId: "579679958637",
  appId: "1:579679958637:web:38705cebd28d47fc803164",
  measurementId: "G-0MLWMN815Q"
};

// Firebase 앱 초기화 및 Firestore 인스턴스 생성
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 업데이트하거나 추가할 카테고리 데이터를 배열로 정의
const categories = [
  { id: 'tech', name: 'Technology', description: '기술 관련 글' },
  { id: 'life', name: 'Lifestyle', description: '라이프 스타일 및 취미 관련 글' },
  { id: 'news', name: 'News', description: '최신 뉴스 및 시사' }
];

/**
 * Firestore의 "categories" 컬렉션에 데이터 추가/업데이트하는 함수
 * 이 방식은 Firebase 클라이언트 SDK를 사용하므로,
 * Firestore 보안 규칙이 클라이언트 업데이트를 허용해야 합니다.
 */
async function updateCategories() {
  try {
    for (const category of categories) {
      // setDoc 함수는 merge 옵션을 통해 기존 데이터를 병합하여 업데이트합니다.
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      console.log(`카테고리 '${category.id}'가 업데이트되었습니다.`);
    }
    console.log('모든 카테고리 업데이트 완료!');
  } catch (error) {
    console.error('카테고리 업데이트 중 에러 발생:', error);
  } finally {
    process.exit(0);
  }
}

updateCategories(); 