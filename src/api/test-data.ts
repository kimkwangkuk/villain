import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

/**
 * 테스트 데이터 생성 함수
 */
export const createTestData = async () => {
  try {
    // 1. 카테고리 생성
    const categoryRef = await addDoc(collection(db, 'categories'), {
      name: "테스트 카테고리",
      description: "테스트용 카테고리입니다",
      createdAt: serverTimestamp()
    });
    console.log('카테고리 생성됨:', categoryRef.id);

    // 2. 게시글 생성
    const postRef = await addDoc(collection(db, 'posts'), {
      title: "테스트 게시글",
      content: "이것은 테스트 게시글입니다.",
      authorId: "test-author",
      authorName: "테스트 작성자",
      categoryId: categoryRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      comments: []
    });
    console.log('게시글 생성됨:', postRef.id);

    return { categoryId: categoryRef.id, postId: postRef.id };
  } catch (error) {
    console.error('테스트 데이터 생성 실패:', error);
    throw error;
  }
};

/**
 * 테스트 포스트 생성 함수
 */
export const createTestPosts = async () => {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const categories = categoriesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Array<{ id: string; name: string; [key: string]: any }>;
  
  const posts = [];
  for (const category of categories) {
    for (let i = 1; i <= 5; i++) {
      const post = {
        title: `${category.name} 사례 #${i}`,
        content: `이것은 ${category.name}의 ${i}번째 사례입니다. 여기에 자세한 내용이 들어갑니다...`,
        categoryId: category.id,
        authorId: "test-author",
        authorName: "테스트 작성자",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: Math.floor(Math.random() * 50),
        commentCount: 0
      };
      
      const docRef = await addDoc(collection(db, 'posts'), post);
      posts.push({ id: docRef.id, ...post });
    }
  }
  
  console.log('테스트 포스트 생성 완료:', posts.length);
  return posts;
};

// 브라우저 환경에서만 window 객체에 함수 노출
if (typeof window !== 'undefined') {
  (window as any).createTestData = createTestData;
  (window as any).createTestPosts = createTestPosts;
} 