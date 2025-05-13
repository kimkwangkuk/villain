import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

export interface UserData extends DocumentData {
  id: string;
  userId: string;
  email: string;
  username?: string;
  photoURL?: string;
  createdAt: any;
  bio?: string;
}

/**
 * 사용자 정보 가져오기
 * @param userId 사용자 ID
 * @returns 사용자 정보
 */
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

/**
 * 사용자 프로필 업데이트
 * @param userId 사용자 ID
 * @param userData 업데이트할 사용자 정보
 * @returns 성공 여부
 */
export const updateUserProfile = async (userId: string, userData: Partial<UserData>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('사용자 프로필 업데이트 실패:', error);
    return false;
  }
};

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns 현재 사용자 정보
 */
export const getCurrentUser = async (): Promise<UserData | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return getUserDoc(user.uid);
};

/**
 * 사용자 정보 저장 (회원가입 시 또는 업데이트)
 * @param user Firebase 사용자 객체
 * @param additionalData 추가 사용자 정보
 * @returns 성공 여부
 */
export const saveUserData = async (
  user: FirebaseUser, 
  additionalData?: Partial<UserData>
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      userId: user.uid,
      email: user.email,
      username: user.displayName || additionalData?.username,
      photoURL: user.photoURL || additionalData?.photoURL,
      createdAt: new Date(),
      ...additionalData
    };
    
    await setDoc(userRef, userData, { merge: true });
    return true;
  } catch (error) {
    console.error('사용자 정보 저장 실패:', error);
    return false;
  }
}; 