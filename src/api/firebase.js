import { db, auth } from '../firebase';
import { 
  collection, getDocs, getDoc, addDoc, doc,
  query, orderBy, serverTimestamp, updateDoc,
  arrayUnion, where 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

// Posts
export const getPosts = async () => {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPost = async (id) => {
  const docRef = doc(db, 'posts', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Post not found');
  }
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
};

export const createPost = async (postData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const post = {
    ...postData,
    authorId: user.uid,
    authorName: user.displayName || user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    comments: []
  };

  const docRef = await addDoc(collection(db, 'posts'), post);
  return {
    id: docRef.id,
    ...post
  };
};

// Comments
export const addComment = async (postId, commentData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const comment = {
    ...commentData,
    authorId: user.uid,
    authorName: user.displayName || user.email,
    createdAt: serverTimestamp()
  };

  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: arrayUnion(comment)
  });

  return comment;
};

// Categories
export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
// Likes
export const updateLikes = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  await updateDoc(postRef, {
    likes: (postSnap.data().likes || 0) + 1
  });

  return {
    id: postId,
    likes: postSnap.data().likes + 1
  };
}; 

// 테스트 데이터 생성 함수
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

// window 객체에 추가
window.createTestData = createTestData; 

// 로그인
export const login = async (email, password) => {
  console.log('로그인 시도:', { email, password });
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase 로그인 에러:', error);
    throw error;
  }
};

// 회원가입
export const signup = async ({ email, password }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}; 
