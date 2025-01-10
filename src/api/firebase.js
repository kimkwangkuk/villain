import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

// 댓글 작성
export const addComment = async (postId, content, userId) => {
  try {
    const commentsRef = collection(db, 'comments');
    const newComment = {
      content,
      userId,
      postId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(commentsRef, newComment);
    return {
      id: docRef.id,
      ...newComment
    };
  } catch (error) {
    throw error;
  }
};

// 댓글 조회
export const getComments = async (postId) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
}; 