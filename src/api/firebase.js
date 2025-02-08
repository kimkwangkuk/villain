import { db, auth } from '../firebase';
import { 
  collection, getDocs, getDoc, addDoc, doc,
  query, orderBy, serverTimestamp, updateDoc,
  arrayUnion, where, arrayRemove, setDoc,
  increment, deleteDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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

  // Firestore에서 사용자 정보 가져오기
  const userDoc = await getUserDoc(user.uid);
  
  // 카테고리 정보 가져오기
  const categoryRef = doc(db, 'categories', postData.categoryId);
  const categoryDoc = await getDoc(categoryRef);
  const categoryName = categoryDoc.exists() ? categoryDoc.data().name : '';

  const post = {
    ...postData,
    authorId: user.uid,
    authorName: user.displayName || user.email,
    authorPhotoURL: userDoc.photoURL,
    categoryName: categoryName,  // 카테고리 이름 추가
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    commentCount: 0, // 댓글 수 필드 추가
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

// 사용자 상호작용 게시글 가져오기
export const getUserInteractions = async (userId) => {
  const interactions = []; // 댓글 및 좋아요를 저장할 배열

  // 댓글이 있는 게시글 가져오기 - 필드명을 'authorId'에서 'userId'로 수정
  const commentsSnapshot = await getDocs(query(collection(db, 'comments'), where('userId', '==', userId)));
  commentsSnapshot.forEach(commentDoc => {
    interactions.push({ postId: commentDoc.data().postId, type: 'comment' });
  });

  // 좋아요가 있는 게시글 가져오기
  const postsSnapshot = await getDocs(query(collection(db, 'posts'), where('likedBy', 'array-contains', userId)));
  postsSnapshot.forEach(postDoc => {
    interactions.push({ postId: postDoc.id, type: 'like' });
  });

  return interactions;
};

// Comments
export const addComment = async (postId, commentContent) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  // 사용자 정보 가져오기
  const userDoc = await getUserDoc(user.uid);

  const comment = {
    content: commentContent,
    postId: postId,
    userId: user.uid,
    author: userDoc.username || user.email,
    photoURL: userDoc.photoURL || user.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    // comments 컬렉션에 댓글 추가
    const commentRef = await addDoc(collection(db, 'comments'), comment);
    
    // posts 컬렉션의 댓글 수 업데이트
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });

    // (추가) 댓글 작성과 관련한 알림 생성 로직
    // 게시글의 작성자 정보를 가져오기
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      // 댓글 작성자와 게시글 작성자가 다를 경우 알림 생성
      if (postData.authorId !== user.uid) {
        await createNotification(
          'comment',      // 알림 타입 (예: 'comment')
          postId,         // 연관된 포스트 ID
          postData.authorId,  // 알림 수신자 (게시글 작성자)
          user.uid,       // 댓글 작성자 (알림 발신자)
          userDoc.username || user.email, // 발신자 이름
          commentContent  // 추가 내용: 댓글 내용 등
        );
      }
    }

    return {
      id: commentRef.id,
      ...comment
    };
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    throw error;
  }
};

// 댓글 수정 함수
export const updateComment = async (commentId, newContent) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      content: newContent,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    throw error;
  }
};

// 댓글 삭제 함수
export const deleteComment = async (postId, commentId) => {
  try {
    // comments 컬렉션에서 댓글 삭제
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
    
    // posts 컬렉션의 댓글 수 감소
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    throw error;
  }
};

// 특정 게시글의 댓글 목록 가져오기
export const getPostComments = async (postId) => {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Categories
export const getCategories = async () => {
  const q = query(
    collection(db, 'categories'),
    orderBy('order')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
// Likes
export const updateLikes = async (postId, userId, senderName = '익명') => {
  console.log('updateLikes 호출:', { postId, userId });
  
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    console.error('포스트를 찾을 수 없음');
    throw new Error('Post not found');
  }

  const post = postDoc.data();
  const likedBy = post.likedBy || [];
  const isLiked = likedBy.includes(userId);

  // 좋아요 상태 업데이트
  await updateDoc(postRef, {
    likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });

  // 새로운 좋아요 추가인 경우, 그리고 포스트 작성자와 좋아요 누른 사용자가 다르면 알림 생성
  if (!isLiked && post.authorId && post.authorId !== userId) {
    try {
      await createNotification(
        'like',                   // 알림 타입
        postId,                   // 포스트 ID
        post.authorId,            // 알림 수신자 (포스트 작성자)
        userId,                   // 알림 발신자 (좋아요 누른 사용자)
        senderName,               // 발신자 이름
        '게시글을 좋아합니다.'      // 알림 내용
      );
      console.log('좋아요 알림 생성 완료');
    } catch (error) {
      console.error('좋아요 알림 생성 실패:', error);
    }
  }

  const updatedLikes = isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1;
  const updatedLikedBy = isLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId];

  return {
    ...post,
    id: postId,
    likes: updatedLikes,
    likedBy: updatedLikedBy
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
export const signup = async ({ email, password, username, photoURL }) => {
  try {
    // 1. Firebase Auth에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. 사용자 프로필 업데이트 (displayName과 photoURL 모두 설정)
    await updateProfile(auth.currentUser, {
      displayName: username,
      photoURL: photoURL
    });
    
    // 3. Firestore에 사용자 정보 저장
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      email: email,
      username: username,
      photoURL: photoURL,
      createdAt: new Date(),
      bio: '',
      userId: userCredential.user.uid
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

export const createCategories = async () => {
  const categories = [
    { name: "직장인 빌런", description: "직장 내 빌런 유형", order: 1 },
    { name: "학교 빌런", description: "학교에서 만나는 빌런", order: 2 },
    { name: "카페 빌런", description: "카페에서 마주치는 빌런", order: 3 },
    { name: "식당 빌런", description: "식당에서 마주치는 빌런", order: 4 },
    { name: "대중교통 빌런", description: "대중교통에서 만나는 빌런", order: 5 },
    { name: "운동시설 빌런", description: "운동시설에서 마주치는 빌런", order: 6 },
    { name: "병원 빌런", description: "병원에서 마주치는 빌런", order: 7 },
    { name: "공공장소 빌런", description: "공공장소에서 만나는 빌런", order: 8 },
    { name: "온라인 빌런", description: "온라인에서 만나는 빌런", order: 9 },
    { name: "이웃 빌런", description: "이웃/아파트에서 만나는 빌런", order: 10 }
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
    const docRef = await addDoc(collection(db, 'notifications'), {
      type,
      postId,
      recipientId,
      senderId,
      senderName,
      content,
      createdAt: new Date(),
      read: false
    });
    console.log('알림 생성 완료:', {
      id: docRef.id,
      type,
      postId,
      recipientId,
      senderId,
      senderName,
      content
    });
    return docRef;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    throw error;
  }
};

// 사용자의 게시글 가져오기
export const getMyPosts = async (userId) => {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', userId), // 현재 사용자의 ID와 일치하는 게시글만 가져오기
    orderBy('createdAt', 'desc') // 생성일 기준으로 정렬
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateUserBio = async (userId, bio) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // 사용자 문서가 없으면 새로 생성
      await setDoc(userRef, {
        bio: bio,
        userId: userId,
        createdAt: new Date()
      });
    } else {
      // 기존 문서가 있으면 업데이트
      await updateDoc(userRef, {
        bio: bio
      });
    }
    return true;
  } catch (error) {
    console.error('자기소개 업데이트 실패:', error);
    throw error;
  }
};

export const getUserDoc = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // 사용자 문서가 없으면 기본값으로 생성
      const defaultUserData = {
        userId: userId,
        bio: '',
        createdAt: new Date()
      };
      await setDoc(userRef, defaultUserData);
      return defaultUserData;
    }
    
    return userSnap.data();
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
};

// 댓글 좋아요 업데이트 함수
export const updateCommentLikes = async (commentId, userId) => {
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
    ...data,
    id: commentId,
    likes: isLiked ? (data.likes || 0) - 1 : (data.likes || 0) + 1,
    likedBy: isLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId]
  };
};

/**
 * 랜덤 프로필 이미지 가져오기
 * Firebase Storage에 등록된 프로필 이미지(예: woman1.webp, woman2.webp 등) 중 하나를 랜덤으로 가져옵니다.
 */
const getRandomProfileImage = async () => {
  try {
    const storage = getStorage();
    const imageNumber = Math.floor(Math.random() * 2) + 1; // 예: 1 또는 2 선택
    const imageRef = ref(storage, `profile_images/woman${imageNumber}.webp`);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('프로필 이미지 가져오기 실패:', error);
    return null;
  }
};

/**
 * Google 로그인: 기본으로 구글에서 제공하는 이미지 대신 랜덤 프로필 이미지를 적용
 */
export const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // 이메일 가입 시와 동일하게 랜덤 프로필 이미지 적용
    const randomProfileUrl = await getRandomProfileImage();
    if (randomProfileUrl) {
      await updateProfile(userCredential.user, { photoURL: randomProfileUrl });
    }
    
    // Firestore에 사용자 정보 저장 (업데이트)
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(
      userRef,
      {
        email: userCredential.user.email,
        username: userCredential.user.displayName || userCredential.user.email,
        photoURL: randomProfileUrl || userCredential.user.photoURL,
        createdAt: new Date(),
        bio: '',
        userId: userCredential.user.uid
      },
      { merge: true }
    );
    
    return userCredential.user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};
