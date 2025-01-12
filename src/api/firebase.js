import { db, auth } from '../firebase';
import { 
  collection, getDocs, getDoc, addDoc, doc,
  query, orderBy, serverTimestamp, updateDoc,
  arrayUnion 
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

  try {
    const docRef = await addDoc(collection(db, 'posts'), post);
    return {
      id: docRef.id,
      ...post
    };
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    throw error;
  }
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
export const updateLikes = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  const post = postSnap.data();
  const likedBy = post.likedBy || [];
  const isLiked = likedBy.includes(userId);

  // 좋아요 토글
  await updateDoc(postRef, {
    likes: isLiked ? post.likes - 1 : post.likes + 1,
    likedBy: isLiked 
      ? likedBy.filter(id => id !== userId) 
      : [...likedBy, userId]
  });

  return {
    ...post,
    id: postId,
    likes: isLiked ? post.likes - 1 : post.likes + 1,
    likedBy: isLiked 
      ? likedBy.filter(id => id !== userId) 
      : [...likedBy, userId]
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

export const createCategories = async () => {
  const categories = [
    { name: "직장인 빌런", description: "직장 내 빌런 유형" },
    { name: "학교 빌런", description: "학교에서 만나는 빌런" },
    { name: "카페 빌런", description: "카페에서 마주치는 빌런" },
    { name: "식당 빌런", description: "식당에서 마주치는 빌런" },
    { name: "대중교통 빌런", description: "대중교통에서 만나는 빌런" },
    { name: "운동시설 빌런", description: "운동시설에서 마주치는 빌런" },
    { name: "병원 빌런", description: "병원에서 마주치는 빌런" },
    { name: "공공장소 빌런", description: "공공장소에서 만나는 빌런" },
    { name: "온라인 빌런", description: "온라인에서 만나는 빌런" },
    { name: "이웃 빌런", description: "이웃/아파트에서 만나는 빌런" }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp()
    });
    createdCategories.push({ id: docRef.id, ...category });
  }
  return createdCategories;
};

// 테스트 포스트 생성 함수 추가
export const createTestPosts = async () => {
  const categories = await getCategories();
  
  const posts = [];
  for (const category of categories) {
    for (let i = 1; i <= 10; i++) {
      const post = {
        title: `${category.name} 사례 #${i}`,
        content: `이것은 ${category.name}의 ${i}번째 사례입니다. 여기에 자세한 내용이 들어갑니다...`,
        categoryId: category.id,
        authorId: "test-author",
        authorName: "테스트 작성자",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: Math.floor(Math.random() * 50),
        comments: []
      };
      
      const docRef = await addDoc(collection(db, 'posts'), post);
      posts.push({ id: docRef.id, ...post });
    }
  }
  return posts;
};

// window 객체에 함수 추가
window.createCategories = createCategories;
window.createTestPosts = createTestPosts;

export const createNotification = async (type, postId, recipientId, senderId, senderName, content = '') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      type,
      postId,
      recipientId,
      senderId,
      senderName,
      content,
      createdAt: new Date(),
      read: false
    });
  } catch (error) {
    console.error('알림 생성 실패:', error);
  }
};
