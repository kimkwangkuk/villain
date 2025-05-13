import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  [key: string]: any;
}

/**
 * 게시물 반응 업데이트
 */
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

/**
 * 게시물 반응 데이터 가져오기
 */
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