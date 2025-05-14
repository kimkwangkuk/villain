import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  arrayUnion, 
  arrayRemove, 
  increment,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { Post } from './post';

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

/**
 * 댓글 좋아요 업데이트
 * @param commentId 댓글 ID
 * @param userId 사용자 ID
 * @returns 업데이트된 댓글 정보
 */
export const updateCommentLikes = async (commentId: string, userId: string): Promise<Comment> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentSnapshot = await getDoc(commentRef);
    
    if (!commentSnapshot.exists()) {
      throw new Error('댓글이 존재하지 않습니다.');
    }
    
    const comment = commentSnapshot.data();
    const likedBy = comment.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // 좋아요 취소
      await updateDoc(commentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // 좋아요 추가
      await updateDoc(commentRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
    
    // 업데이트 후 댓글 정보 다시 가져오기
    const updatedSnapshot = await getDoc(commentRef);
    return {
      id: commentId,
      ...updatedSnapshot.data()
    } as Comment;
  } catch (error) {
    console.error('댓글 좋아요 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 대댓글 추가
 * @param postId 게시글 ID
 * @param parentCommentId 부모 댓글 ID
 * @param replyContent 대댓글 내용
 * @returns 생성된 대댓글 정보
 */
export const addReply = async (postId: string, parentCommentId: string, replyContent: string): Promise<Reply> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다');
    
    // 부모 댓글 확인
    const commentRef = doc(db, 'comments', parentCommentId);
    const commentSnapshot = await getDoc(commentRef);
    
    if (!commentSnapshot.exists()) {
      throw new Error('댓글이 존재하지 않습니다');
    }
    
    // 사용자 정보 가져오기
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    // 대댓글 생성
    const replyRef = collection(commentRef, 'replies');
    const newReply = {
      content: replyContent,
      authorId: user.uid,
      authorName: userData?.username || user.displayName || user.email || '익명',
      authorPhotoURL: userData?.photoURL || user.photoURL || null,
      createdAt: serverTimestamp(),
      postId: postId
    };
    
    const replyDoc = await addDoc(replyRef, newReply);
    
    return {
      id: replyDoc.id,
      ...newReply
    } as Reply;
  } catch (error) {
    console.error('대댓글 작성 실패:', error);
    throw error;
  }
};

/**
 * 댓글의 대댓글 목록 가져오기
 * @param parentCommentId 부모 댓글 ID
 * @returns 대댓글 목록
 */
export const getReplies = async (parentCommentId: string): Promise<Reply[]> => {
  try {
    const parentCommentRef = doc(db, 'comments', parentCommentId);
    const repliesSnapshot = await getDocs(collection(parentCommentRef, 'replies'));
    
    return repliesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reply[];
  } catch (error) {
    console.error('대댓글 가져오기 실패:', error);
    return [];
  }
};

/**
 * 댓글 삭제
 * @param postId 게시글 ID
 * @param commentId 댓글 ID
 */
export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다');
    
    // 댓글 정보 가져오기
    const commentRef = doc(db, 'comments', commentId);
    const commentSnapshot = await getDoc(commentRef);
    
    if (!commentSnapshot.exists()) {
      throw new Error('댓글이 존재하지 않습니다');
    }
    
    const commentData = commentSnapshot.data();
    
    // 자신의 댓글만 삭제 가능 (또는 관리자)
    if (commentData.authorId !== user.uid) {
      throw new Error('자신의 댓글만 삭제할 수 있습니다');
    }
    
    // 대댓글 먼저 삭제
    const repliesSnapshot = await getDocs(collection(commentRef, 'replies'));
    const replyDeletions = repliesSnapshot.docs.map(replyDoc =>
      deleteDoc(doc(commentRef, 'replies', replyDoc.id))
    );
    await Promise.all(replyDeletions);
    
    // 댓글 삭제
    await deleteDoc(commentRef);
    
    // 게시글의 댓글 수 감소
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    throw error;
  }
};

/**
 * 대댓글 삭제
 * @param postId 게시글 ID
 * @param commentId 댓글 ID
 * @param replyId 대댓글 ID
 */
export const deleteReply = async (postId: string, commentId: string, replyId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다');
    
    // 대댓글 정보 가져오기
    const commentRef = doc(db, 'comments', commentId);
    const replyRef = doc(collection(commentRef, 'replies'), replyId);
    const replySnapshot = await getDoc(replyRef);
    
    if (!replySnapshot.exists()) {
      throw new Error('대댓글이 존재하지 않습니다');
    }
    
    const replyData = replySnapshot.data();
    
    // 자신의 대댓글만 삭제 가능 (또는 관리자)
    if (replyData.authorId !== user.uid) {
      throw new Error('자신의 대댓글만 삭제할 수 있습니다');
    }
    
    // 대댓글 삭제
    await deleteDoc(replyRef);
  } catch (error) {
    console.error('대댓글 삭제 실패:', error);
    throw error;
  }
}; 