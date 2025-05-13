import { db } from '@/firebase/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

// 사용자 정보 가져오기
export const getUserDoc = async (userId: string): Promise<DocumentData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.log('사용자 정보가 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
}; 