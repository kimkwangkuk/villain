import { db } from '../firebase';
import { collection, getDocs, orderBy, query, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  order: number;
  description?: string;
  customId?: string;
}

/**
 * 카테고리 목록 가져오기
 * @returns 정렬된 카테고리 목록
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('카테고리 가져오기 시작');
    const q = query(
      collection(db, 'categories'),
      orderBy('order')
    );
    const categoriesSnapshot = await getDocs(q);
    const categories = categoriesSnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    })) as Category[];
    
    console.log(`카테고리 ${categories.length}개 가져오기 성공:`, categories.map(c => c.name));
    return categories;
  } catch (error) {
    console.error('카테고리 가져오기 실패:', error);
    // 에러 발생 시 빈 배열 반환하여 앱이 계속 작동할 수 있도록 함
    return [];
  }
};

/**
 * 특정 카테고리 정보 가져오기
 * @param categoryId 카테고리 ID
 * @returns 카테고리 정보
 */
export const getCategory = async (categoryId: string): Promise<Category | null> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnapshot = await getDoc(categoryRef);
    
    if (!categorySnapshot.exists()) {
      return null;
    }
    
    return {
      id: categorySnapshot.id,
      ...categorySnapshot.data()
    } as Category;
  } catch (error) {
    console.error('카테고리 정보 가져오기 실패:', error);
    return null;
  }
};

/**
 * 테스트용 카테고리 생성 함수
 * @returns 생성된 카테고리 목록
 */
export const createCategories = async (): Promise<Category[]> => {
  const categories = [
    { customId: 'category1', order: 1, name: "스타트업", description: "소규모 신생 기업에서 발생하는 문제 상황. 예시: 업무 과부하, 잦은 방향 전환, 불안정한 고용 환경" },
    { customId: 'category2', order: 2, name: "중소기업", description: "중소기업 환경에서 발생하는 문제 상황. 예시: 다재다능 강요, 비효율적인 시스템, 임금 체불" },
    { order: 3, name: "대기업", description: "대기업 환경에서 발생하는 문제 상황. 예시: 과도한 보고 문화, 끝없는 회의, 상명하복식 의사결정, 내부 정치 싸움" },
    { order: 4, name: "서비스업", description: "고객 응대가 많은 업종(카페, 식당, 백화점, 콜센터 등). 예시: 진상 고객, 반말 손님, 감정 노동 강요하는 상사" },
    { order: 5, name: "공공기관", description: "공무원, 공기업 직원들이 겪는 문제 상황. 예시: 과도한 민원, 공공시설 훼손, 무리한 요구" },
    { order: 6, name: "의료직", description: "병원, 요양원, 약국 등에서 근무하는 의료진이 겪는 문제 상황. 예시: 무리한 요구 환자, 보호자 갑질, 비협조적인 환자" },
    { order: 7, name: "교육직", description: "초중고교, 대학교, 학원 등에서 발생하는 문제 상황. 예시: 학부모 민원, 무례한 학생, 책임 회피하는 동료 교사" },
    { order: 8, name: "공장/생산직", description: "제조업, 생산라인, 물류센터 등에서 발생하는 문제 상황. 예시: 안전불감증, 업무 미루기, 비협조적인 조장" },
    { order: 9, name: "건설업", description: "건설 현장, 토목 공사, 인테리어 업종에서 발생하는 문제 상황. 예시: 부실 시공, 작업 안전 무시, 임금 체불" },
    { order: 10, name: "유통/물류", description: "마트, 편의점, 배달업 등에서 발생하는 문제 상황. 예시: 상품 훼손, 계산대 진상, 배달 클레임" },
    { order: 11, name: "프리랜서", description: "작가, 디자이너, 영상 제작자, 프리랜서 등이 겪는 문제 상황. 예시: 돈 떼먹는 클라이언트, 수정 무한 요청, 아이디어 도용" },
    { order: 12, name: "경찰", description: "경찰이 업무 중 겪는 문제 상황. 예시: 시민과의 마찰, 불필요한 신고, 내부 갈등" },
    { order: 13, name: "소방", description: "소방관이 업무 중 겪는 문제 상황. 예시: 허위 신고, 장비 부족, 위험한 출동 상황" },
    { order: 14, name: "군대", description: "군대에서 발생하는 문제 상황. 예시: 가혹 행위, 부조리, 무책임한 간부" }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp()
    });
    createdCategories.push({ id: docRef.id, ...category });
  }
  
  console.log('카테고리 생성 완료:', createdCategories.length);
  return createdCategories;
}; 