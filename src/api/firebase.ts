import { db, auth } from '../firebase/firebase';
import { 
  collection, getDocs, getDoc, addDoc, doc,
  query, orderBy, serverTimestamp, where, limit
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// 인터페이스 정의
export interface Category {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt: any;
  updatedAt?: any;
  likes?: number;
  commentCount?: number;
  [key: string]: any;
}

// 게시글 목록 가져오기
export const getPosts = async (): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[];
};

// 특정 게시글 가져오기
export const getPost = async (id: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Post;
  } catch (error) {
    console.error('Post not found:', error);
    return null;
  }
};

// 카테고리 목록 가져오기
export const getCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, 'categories'),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Category[];
};

// 사용자 정보 가져오기
export const getUserDoc = async (userId: string): Promise<any> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const defaultUserData = {
        userId: userId,
        createdAt: new Date()
      };
      return defaultUserData;
    }
    
    return userSnap.data();
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
}; 