import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * 콘텐츠 신고하기
 * @param type 신고 유형 (post, comment, reply)
 * @param contentId 신고할 콘텐츠 ID
 * @param reporterId 신고자 ID
 * @param reason 신고 이유
 * @returns 신고 성공 여부
 */
export const reportContent = async (
  type: string, 
  contentId: string, 
  reporterId: string, 
  reason: string
): Promise<boolean> => {
  try {
    // 이미 신고했는지 확인
    const alreadyReported = await hasAlreadyReported(type, contentId, reporterId);
    if (alreadyReported) {
      throw new Error('이미 신고한 콘텐츠입니다.');
    }
    
    // 신고 정보 저장
    const reportData = {
      type,
      contentId,
      reporterId,
      reason,
      status: 'pending', // pending, reviewed, dismissed
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'reports'), reportData);
    return true;
  } catch (error) {
    console.error('신고 실패:', error);
    throw error;
  }
};

/**
 * 이미 신고했는지 확인
 * @param type 신고 유형 (post, comment, reply)
 * @param contentId 콘텐츠 ID
 * @param userId 사용자 ID
 * @returns 이미 신고했는지 여부
 */
export const hasAlreadyReported = async (type: string, contentId: string, userId: string): Promise<boolean> => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('type', '==', type),
      where('contentId', '==', contentId),
      where('reporterId', '==', userId)
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    return !reportsSnapshot.empty;
  } catch (error) {
    console.error('신고 여부 확인 실패:', error);
    return false;
  }
};

/**
 * 관리자용: 신고 목록 가져오기
 * @param status 신고 상태 (옵션)
 * @returns 신고 목록
 */
export const getReports = async (status?: string) => {
  try {
    let reportsQuery;
    
    if (status) {
      reportsQuery = query(
        collection(db, 'reports'),
        where('status', '==', status)
      );
    } else {
      reportsQuery = collection(db, 'reports');
    }
    
    const reportsSnapshot = await getDocs(reportsQuery);
    return reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('신고 목록 가져오기 실패:', error);
    return [];
  }
};