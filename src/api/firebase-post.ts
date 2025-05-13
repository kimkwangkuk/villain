import { db } from '@/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  addDoc,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// 카테고리와 포스트 타입 정의
export interface Category {
  id: string;
  name: string;
  order?: number;
  description?: string;
  [key: string]: any;
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
  likedBy?: string[];
  commentCount?: number;
  reactionCount?: number;
  [key: string]: any;
}

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  [key: string]: any;
}

// 카테고리 목록 가져오기
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as DocumentData
    })) as Category[];
  } catch (error) {
    console.error('카테고리 가져오기 실패:', error);
    return [];
  }
}; 