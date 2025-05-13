import { db } from '../firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

interface UserData extends DocumentData {
  id: string;
  userId: string;
  email: string;
  username?: string;
  photoURL?: string;
  createdAt: any;
}

// 사용자 정보 가져오기
export const getUserDoc = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    return {
      id: userSnapshot.id,
      ...userSnapshot.data()
    } as UserData;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
}; 