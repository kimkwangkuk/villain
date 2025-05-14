import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  serverTimestamp, 
  query,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  orderBy,
  limit
} from 'firebase/firestore';
import { Category } from './categories';

export interface PostData {
  title: string;
  content: string;
  categoryId: string;
}

export interface Post extends PostData {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  categoryName: string;
  createdAt: any; // serverTimestamp 타입
  updatedAt: any; // serverTimestamp 타입
  likes: number;
  likedBy?: string[];
  commentCount: number;
  reactionCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: any;
  updatedAt?: any;
  postId: string;
  likes?: number;
  likedBy?: string[];
  isReply?: boolean;
}

export interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: any;
  postId: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  [key: string]: any;
}

/**
 * 새 게시글 생성
 */
export const createPost = async (postData: PostData): Promise<Post> => {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다');

  // 카테고리 정보 가져오기
  const categoryRef = doc(db, 'categories', postData.categoryId);
  const categoryDoc = await getDoc(categoryRef);
  
  if (!categoryDoc.exists()) {
    throw new Error('존재하지 않는 카테고리입니다');
  }
  
  const categoryName = categoryDoc.data().name;

  // 사용자 정보 가져오기
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.exists() ? userDoc.data() : null;

  const post = {
    ...postData,
    authorId: user.uid,
    authorName: userData?.username || user.displayName || user.email || '익명',
    authorPhotoURL: userData?.photoURL || user.photoURL || null,
    categoryName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    commentCount: 0
  };

  try {
    console.log('게시글 생성 시작:', post);
    const docRef = await addDoc(collection(db, 'posts'), post);
    console.log('게시글 생성 성공:', docRef.id);
    
    return {
      id: docRef.id,
      ...post
    } as Post;
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    throw error;
  }
};

/**
 * 게시글 좋아요 업데이트
 */
export const updateLikes = async (postId: string, userId: string, userName: string): Promise<Post> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      throw new Error('게시물이 존재하지 않습니다.');
    }
    
    const post = postSnapshot.data();
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // 좋아요 취소
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // 좋아요 추가
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
    
    // 업데이트 후 문서 다시 가져오기
    const updatedSnapshot = await getDoc(postRef);
    return {
      id: postId,
      ...updatedSnapshot.data()
    } as Post;
  } catch (error) {
    console.error('좋아요 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    // 1. 해당 포스트의 모든 댓글 가져오기
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    // 2. 각 댓글과 그 댓글의 대댓글들 삭제
    for (const commentDoc of commentsSnapshot.docs) {
      const commentRef = doc(db, 'comments', commentDoc.id);
      
      // 2-1. 대댓글 삭제
      const repliesSnapshot = await getDocs(collection(commentRef, 'replies'));
      const replyDeletions = repliesSnapshot.docs.map(replyDoc =>
        deleteDoc(doc(commentRef, 'replies', replyDoc.id))
      );
      await Promise.all(replyDeletions);

      // 2-2. 댓글 삭제
      await deleteDoc(commentRef);
    }

    // 3. 포스트 삭제
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    
    return true;
  } catch (error) {
    console.error('포스트 삭제 실패:', error);
    throw error;
  }
}; 