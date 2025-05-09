const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc 
} = require('firebase/firestore');

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
  { "order": 1, "id": "a7b3c9d2e8f5", "name": "스타트업", "description": "소규모 신생 기업에서 발생하는 문제 상황. 예시: 업무 과부하, 잦은 방향 전환, 불안정한 고용 환경" },
  { "order": 2, "id": "b2c4d6e8f0a1", "name": "중소기업", "description": "중소기업 환경에서 발생하는 문제 상황. 예시: 다재다능 강요, 비효율적인 시스템, 임금 체불" },
  { "order": 3, "id": "c5d7e9f1a3b6", "name": "대기업", "description": "대기업 환경에서 발생하는 문제 상황. 예시: 과도한 보고 문화, 끝없는 회의, 상명하복식 의사결정, 내부 정치 싸움" },
  { "order": 4, "id": "d8e0f2a4b6c9", "name": "자영업", "description": "고객 응대가 많은 업종(카페, 식당, 백화점, 콜센터 등). 예시: 진상 고객, 반말 손님, 감정 노동 강요하는 상사" },
  { "order": 5, "id": "e1f3a5b7c9d2", "name": "공무원", "description": "공무원, 공기업 직원들이 겪는 문제 상황. 예시: 과도한 민원, 공공시설 훼손, 무리한 요구" },
  { "order": 6, "id": "f4a6b8c0d2e5", "name": "의료직", "description": "병원, 요양원, 약국 등에서 근무하는 의료진이 겪는 문제 상황. 예시: 무리한 요구 환자, 보호자 갑질, 비협조적인 환자" },
  { "order": 7, "id": "g7h9i1j3k5l7", "name": "교육직", "description": "초중고교, 대학교, 학원 등에서 발생하는 문제 상황. 예시: 학부모 민원, 무례한 학생, 책임 회피하는 동료 교사" },
  { "order": 8, "id": "m2n4o6p8q0r2", "name": "공장/생산직", "description": "제조업, 생산라인, 물류센터 등에서 발생하는 문제 상황. 예시: 안전불감증, 업무 미루기, 비협조적인 조장" },
  { "order": 9, "id": "s5t7u9v1w3x5", "name": "건설업", "description": "건설 현장, 토목 공사, 인테리어 업종에서 발생하는 문제 상황. 예시: 부실 시공, 작업 안전 무시, 임금 체불" },
  { "order": 10, "id": "y8z0a2b4c6d8", "name": "유통/물류", "description": "마트, 편의점, 배달업 등에서 발생하는 문제 상황. 예시: 상품 훼손, 계산대 진상, 배달 클레임" },
  { "order": 11, "id": "e9f1g3h5i7j9", "name": "프리랜서", "description": "작가, 디자이너, 영상 제작자, 프리랜서 등이 겪는 문제 상황. 예시: 돈 떼먹는 클라이언트, 수정 무한 요청, 아이디어 도용" },
  { "order": 12, "id": "k2l4m6n8o0p2", "name": "소방", "description": "소방관이 겪는 문제 상황. 예시: 위험한 출동 환경, 부족한 인력과 장비, 외상 후 스트레스" },
  { "order": 13, "id": "q5r7s9t1u3v5", "name": "경찰", "description": "경찰이 겪는 문제 상황. 예시: 무리한 민원인 대응, 위험한 현장 상황, 과도한 업무량" },
  { "order": 14, "id": "w8x0y2z4a6b8", "name": "군인", "description": "군 복무 중 겪는 문제 상황. 예시: 부당한 지시, 가혹 행위, 열악한 근무 환경" }
];

/**
 * Firestore의 "categories" 컬렉션에 데이터 추가/업데이트하는 함수
 * 이 방식은 Firebase 클라이언트 SDK를 사용하므로,
 * Firestore 보안 규칙이 클라이언트 업데이트를 허용해야 합니다.
 */
async function updateCategories() {
  try {
    // 1. 스크립트에 있는 카테고리 업데이트 또는 추가
    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      console.log(`카테고리 '${category.id}'가 업데이트되었습니다.`);
    }
    
    // 2. Firestore에 있는 모든 카테고리 문서 가져오기
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const existingCategoryIds = categoriesSnapshot.docs.map(doc => doc.id);
    
    // 스크립트에 포함된 카테고리 ID 목록
    const definedCategoryIds = categories.map(cat => cat.id);
    
    // 3. 스크립트에 없는 카테고리 문서는 삭제 대상
    const idsToDelete = existingCategoryIds.filter(id => !definedCategoryIds.includes(id));
    
    // 삭제
    for (const id of idsToDelete) {
      await deleteDoc(doc(db, 'categories', id));
      console.log(`카테고리 '${id}'가 삭제되었습니다.`);
    }
    
    console.log('모든 카테고리 업데이트 및 불필요한 카테고리 삭제 완료!');
  } catch (error) {
    console.error('카테고리 업데이트 중 에러 발생:', error);
  } finally {
    process.exit(0);
  }
}

updateCategories(); 