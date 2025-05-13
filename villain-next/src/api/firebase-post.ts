import { db, auth } from '@/firebase';
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
  QueryDocumentSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  orderBy,
  limit
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

export interface UserData {
  id: string;
  userId: string;
  email: string;
  username?: string;
  photoURL?: string;
  createdAt: any;
  [key: string]: any;
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

// 카테고리 목록 가져오기
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    return categoriesSnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    })) as Category[];
  } catch (error) {
    console.error('카테고리 가져오기 실패:', error);
    return [];
  }
};

// 게시물 좋아요 업데이트
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
    
    let updatedLikes = post.likes || 0;
    let updatedLikedBy = [...likedBy];
    
    if (isLiked) {
      // 좋아요 취소
      updatedLikes -= 1;
      updatedLikedBy = updatedLikedBy.filter(uid => uid !== userId);
    } else {
      // 좋아요 추가
      updatedLikes += 1;
      updatedLikedBy.push(userId);
    }
    
    await updateDoc(postRef, {
      likes: updatedLikes,
      likedBy: updatedLikedBy,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: postId,
      ...post,
      likes: updatedLikes,
      likedBy: updatedLikedBy
    } as Post;
  } catch (error) {
    console.error('좋아요 업데이트 실패:', error);
    throw error;
  }
};

// 게시물 반응 업데이트
export const updateReaction = async (postId: string, userId: string, reaction: Reaction | null): Promise<{reactionCount: number}> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      throw new Error('게시물이 존재하지 않습니다.');
    }
    
    const reactionsRef = doc(db, 'post_reactions', postId);
    const reactionsSnapshot = await getDoc(reactionsRef);
    
    if (!reactionsSnapshot.exists()) {
      // 반응 문서가 없으면 생성
      await setDoc(reactionsRef, {
        postId,
        reactions: reaction ? {
          [userId]: reaction
        } : {}
      });
    } else {
      // 반응 문서가 있으면 업데이트
      if (reaction) {
        await updateDoc(reactionsRef, {
          [`reactions.${userId}`]: reaction
        });
      } else {
        // 반응 제거
        await updateDoc(reactionsRef, {
          [`reactions.${userId}`]: null
        });
      }
    }
    
    // 게시물의 반응 수 업데이트
    const allReactions = reactionsSnapshot.exists() ? reactionsSnapshot.data().reactions : {};
    const reactionCount = Object.values(allReactions).filter(Boolean).length;
    
    // 새 반응 추가 시 +1, 반응 취소 시 -1, 다른 반응으로 변경 시 유지
    const newReactionCount = reaction
      ? (allReactions[userId] ? reactionCount : reactionCount + 1)
      : (allReactions[userId] ? reactionCount - 1 : reactionCount);
    
    await updateDoc(postRef, {
      reactionCount: newReactionCount,
      updatedAt: serverTimestamp()
    });
    
    return {
      reactionCount: newReactionCount
    };
  } catch (error) {
    console.error('반응 업데이트 실패:', error);
    throw error;
  }
};

// 게시물 반응 데이터 가져오기
export const getPostReactions = async (postId: string): Promise<Record<string, Reaction>> => {
  try {
    const reactionsRef = doc(db, 'post_reactions', postId);
    const reactionsSnapshot = await getDoc(reactionsRef);
    
    if (!reactionsSnapshot.exists()) {
      return {};
    }
    
    return reactionsSnapshot.data().reactions || {};
  } catch (error) {
    console.error('반응 데이터 가져오기 실패:', error);
    return {};
  }
};

// 게시물 삭제
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

// 게시물/댓글 신고하기
export const reportContent = async (
  type: string, 
  contentId: string, 
  reporterId: string, 
  reason: string
): Promise<boolean> => {
  try {
    // 신고 ID 생성 (고유한 ID로 중복 신고 방지)
    const reportId = `${type}_${contentId}_${reporterId}`;
    const reportRef = doc(db, 'reports', reportId);
    
    // 신고 정보 저장
    await setDoc(reportRef, {
      type, // 'post', 'comment' 등
      contentId,
      reporterId,
      reason,
      status: 'pending', // 'pending', 'reviewed', 'dismissed'
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('신고 처리 실패:', error);
    throw error;
  }
};

// 댓글 좋아요 업데이트 함수
export const updateCommentLikes = async (commentId: string, userId: string): Promise<Comment> => {
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) {
    console.error('댓글을 찾을 수 없음');
    throw new Error('Comment not found');
  }
  
  const data = commentSnap.data();
  const likedBy = data.likedBy || [];
  const isLiked = likedBy.includes(userId);
  
  await updateDoc(commentRef, {
    likes: isLiked ? (data.likes || 0) - 1 : (data.likes || 0) + 1,
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
  
  return {
    id: commentId,
    ...data,
    likes: isLiked ? (data.likes || 0) - 1 : (data.likes || 0) + 1,
    likedBy: isLiked ? likedBy.filter((id: string) => id !== userId) : [...likedBy, userId]
  } as Comment;
};

// 대댓글 추가
export const addReply = async (postId: string, parentCommentId: string, replyContent: string): Promise<Reply> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  try {
    const userDoc = await getUserDoc(user.uid);
    const reply = {
      content: replyContent,
      authorId: user.uid,
      authorName: userDoc?.username || user.email || user.displayName,
      authorPhotoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isReply: true,
      parentCommentId,
      postId
    };

    // 댓글의 서브컬렉션으로 대댓글 추가
    const replyRef = await addDoc(
      collection(db, 'comments', parentCommentId, 'replies'), 
      reply
    );
    
    // posts 컬렉션의 댓글 수 업데이트
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });

    return {
      id: replyRef.id,
      ...reply,
      createdAt: new Date()
    } as Reply;
  } catch (error) {
    throw error;
  }
};

// 대댓글 목록 가져오기
export const getReplies = async (parentCommentId: string): Promise<Reply[]> => {
  const q = query(
    collection(db, 'comments', parentCommentId, 'replies'),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
    createdAt: docSnapshot.data().createdAt?.toDate()
  })) as Reply[];
};

// 댓글 삭제 함수
export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const postRef = doc(db, 'posts', postId);
    
    // 게시글 정보 가져오기
    const postDoc = await getDoc(postRef);
    const currentCommentCount = postDoc.data()?.commentCount || 0;
    
    // 대댓글 확인
    const repliesSnapshot = await getDocs(collection(commentRef, 'replies'));
    const hasReplies = !repliesSnapshot.empty;

    // 대댓글 유무와 관계없이 댓글 완전 삭제
    if (!hasReplies) {
      await deleteDoc(commentRef);
      
      // 게시글의 댓글 수 감소 (0 미만이 되지 않도록)
      if (currentCommentCount > 0) {
        await updateDoc(postRef, {
          commentCount: currentCommentCount - 1
        });
      }
    } else {
      // 대댓글이 있는 경우에만 내용 삭제 처리하고 사용자 정보 숨김
      await updateDoc(commentRef, {
        content: '[삭제된 댓글입니다]',
        isDeleted: true,
        authorName: '삭제된 댓글',
        authorPhotoURL: null
      });
    }
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    throw error;
  }
};

// 대댓글 삭제
export const deleteReply = async (postId: string, commentId: string, replyId: string): Promise<void> => {
  try {
    // 대댓글 삭제
    const replyRef = doc(db, 'comments', commentId, 'replies', replyId);
    await deleteDoc(replyRef);
    
    // 게시글 정보 가져오기
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    const currentCommentCount = postDoc.data()?.commentCount || 0;
    
    // 게시글의 댓글 수 감소 (0 미만이 되지 않도록)
    if (currentCommentCount > 0) {
      await updateDoc(postRef, {
        commentCount: currentCommentCount - 1
      });
    }
  } catch (error) {
    console.error('대댓글 삭제 실패:', error);
    throw error;
  }
};

// 이미 신고한 컨텐츠인지 확인
export const hasAlreadyReported = async (type: string, contentId: string, userId: string): Promise<boolean> => {
  try {
    const reportRef = collection(db, 'reports');
    const q = query(
      reportRef,
      where('type', '==', type),
      where('contentId', '==', contentId),
      where('reporterId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('신고 확인 실패:', error);
    throw error;
  }
}; 