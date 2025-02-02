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
    { "id": "workplace", "name": "직장 빌런", "description": "직장에서 만나는 빌런들, 동료, 상사, 부하 직원 등의 사례" },
    { "id": "customer", "name": "진상 빌런", "description": "악성 민원인, 진상 손님 등 고객 관련 빌런 사례" },
    { "id": "neighborhood", "name": "이웃 빌런", "description": "층간 소음, 공동 공간 무단 점유, 쓰레기 무단 투기 등" },
    { "id": "public_transport", "name": "대중교통 빌런", "description": "지하철, 버스에서 자리 독점, 큰 소리로 통화, 새치기하는 사람들" },
    { "id": "parking", "name": "주차 빌런", "description": "주차장에서 남의 자리에 불법 주차, 이중 주차, 경적 시비 등" },
    { "id": "online", "name": "온라인 빌런", "description": "온라인에서 만나는 빌런들, 악플러, 사기꾼, 트롤 등" },
    { "id": "gym", "name": "운동 빌런", "description": "헬스장에서 기구 독점, 소리 크게 내기, 매너 없는 행동 등" }
  
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