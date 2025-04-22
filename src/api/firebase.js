  import { db, auth } from '../firebase';
  import { 
    collection, getDocs, getDoc, addDoc, doc,
    query, orderBy, serverTimestamp, updateDoc,
    arrayUnion, where, arrayRemove, setDoc,
    increment, deleteDoc, limit
  } from 'firebase/firestore';
  import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
  } from 'firebase/auth';
  import { getStorage, ref, getDownloadURL } from 'firebase/storage';
  import { generateRandomUsername } from '../scripts/usernameWords';

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
      authorName: userDoc.username || user.email || user.displayName,
      authorPhotoURL: user.photoURL || null,
      categoryName: categoryName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      commentCount: 0,
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
    if (!userId) {
      console.error('유효하지 않은 사용자 ID:', userId);
      return [];
    }
    
    console.log('상호작용 조회 시작 - 사용자 ID:', userId);
    const interactions = []; // 댓글 및 반응을 저장할 배열

    try {
      // 댓글이 있는 게시글 가져오기
      console.log('댓글 상호작용 조회 중...');
      const commentsSnapshot = await getDocs(
        query(collection(db, 'comments'), where('authorId', '==', userId))
      );
      
      console.log('댓글 상호작용 결과:', commentsSnapshot.size);
      commentsSnapshot.forEach(commentDoc => {
        const commentData = commentDoc.data();
        console.log('댓글 데이터:', commentData);
        if (commentData.postId) {
          interactions.push({ 
            postId: commentData.postId, 
            type: 'comment',
            timestamp: commentData.createdAt
          });
        }
      });

      // 반응이 있는 게시글 가져오기 (최적화 필요)
      console.log('반응 상호작용 조회 중...');
      // 모든 게시물을 가져오는 대신 reactions 필드가 있는 게시물만 가져오도록 최적화 필요
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      
      console.log('게시글 총 개수:', postsSnapshot.size);
      let reactionCount = 0;
      
      postsSnapshot.forEach(postDoc => {
        const postData = postDoc.data();
        // reactions 객체가 있고, 해당 사용자의 반응이 있는지 확인
        if (postData.reactions && postData.reactions[userId]) {
          reactionCount++;
          interactions.push({ 
            postId: postDoc.id, 
            type: 'reaction',
            timestamp: postData.reactions[userId].timestamp || postData.updatedAt
          });
        }
      });
      console.log('반응 상호작용 결과:', reactionCount);

      // 좋아요한 게시글도 가져오기
      console.log('좋아요 상호작용 조회 중...');
      const likedPostsSnapshot = await getDocs(
        query(collection(db, 'posts'), where('likedBy', 'array-contains', userId))
      );
      
      console.log('좋아요 상호작용 결과:', likedPostsSnapshot.size);
      likedPostsSnapshot.forEach(postDoc => {
        interactions.push({ 
          postId: postDoc.id, 
          type: 'like',
          timestamp: postDoc.data().updatedAt
        });
      });

      console.log('총 상호작용 수:', interactions.length);
      return interactions;
    } catch (error) {
      console.error('상호작용 조회 중 오류 발생:', error);
      return [];
    }
  };

  // Comments
  export const addComment = async (postId, content) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const userDoc = await getUserDoc(user.uid);
    const comment = {
      content,
      postId,
      authorId: user.uid,
      authorName: userDoc.username || user.email || user.displayName,
      authorPhotoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isReply: false,
      likes: 0,
      likedBy: []
    };

    try {
      // comments 컬렉션에 댓글 추가
      const commentRef = await addDoc(collection(db, 'comments'), comment);
      
      // posts 컬렉션의 댓글 수 업데이트
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      // 게시글의 작성자 정보를 가져오기
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        // 댓글 작성자와 게시글 작성자가 다를 경우 알림 생성
        if (postData.authorId !== user.uid) {
          await createNotification(
            'comment',
            postId,
            postData.authorId,
            user.uid,
            userDoc.username || user.email || user.displayName,
            content
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
  export const signup = async ({ email, password, photoURL, username }) => {
    console.log('signup 함수 호출됨:', { email, photoURL, username });
    
    try {
      // 전달받은 username을 사용하고, 없는 경우에만 생성하도록 수정
      const finalUsername = username || generateRandomUsername();
      console.log('사용자 이름:', finalUsername);

      // Firebase Auth에 사용자 생성
      console.log('Firebase Auth에 사용자 생성 시도');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth 사용자 생성 성공:', userCredential.user.uid);
      
      // 사용자 프로필 업데이트 (displayName과 photoURL 모두 설정)
      console.log('사용자 프로필 업데이트 시도');
      await updateProfile(auth.currentUser, {
        displayName: finalUsername,
        photoURL: photoURL
      });
      console.log('사용자 프로필 업데이트 성공');
      
      // Firestore에 사용자 정보 저장
      console.log('Firestore에 사용자 정보 저장 시도');
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        username: finalUsername,
        photoURL: photoURL,
        createdAt: new Date(),
        bio: '',
        userId: userCredential.user.uid
      });
      console.log('Firestore 사용자 정보 저장 성공');
      
      return userCredential.user;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  export const createCategories = async () => {
    const categories = [
      { customId: 'category1', order: 1, name: "스타트업", description: "소규모 신생 기업에서 발생하는 문제 상황. 예시: 업무 과부하, 잦은 방향 전환, 불안정한 고용 환경" },
      { customId: 'category2', order: 2, name: "중소기업", description: "중소기업 환경에서 발생하는 문제 상황. 예시: 다재다능 강요, 비효율적인 시스템, 임금 체불" },
      { order: 3, name: "대기업", description: "대기업 환경에서 발생하는 문제 상황. 예시: 과도한 보고 문화, 끝없는 회의, 상명하복식 의사결정, 내부 정치 싸움" },
      { order: 4, name: "서비스업", description: "고객 응대가 많은 업종(카페, 식당, 백화점, 콜센터 등). 예시: 진상 고객, 반말 손님, 감정 노동 강요하는 상사" },
      { order: 5, name: "공공기관", description: "공무원, 공기업 직원들이 겪는 문제 상황. 예시: 과도한 민원, 공공시설 훼손, 무리한 요구" },
      { order: 6, name: "의료직", description: "병원, 요양원, 약국 등에서 근무하는 의료진이 겪는 문제 상황. 예시: 무리한 요구 환자, 보호자 갑질, 비협조적인 환자" },
      { order: 7, name: "교육직", description: "초중고교, 대학교, 학원 등에서 발생하는 문제 상황. 예시: 학부모 민원, 무례한 학생, 책임 회피하는 동료 교사" },
      { order: 8, name: "공장/생산직", description: "제조업, 생산라인, 물류센터 등에서 발생하는 문제 상황. 예시: 안전불감증, 업무 미루기, 비협조적인 조장" },
      { order: 9, name: "건설업", description: "건설 현장, 토목 공사, 인테리어 업종에서 발생하는 문제 상황. 예시: 부실 시공, 작업 안전 무시, 임금 체불" },
      { order: 10, name: "유통/물류", description: "마트, 편의점, 배달업 등에서 발생하는 문제 상황. 예시: 상품 훼손, 계산대 진상, 배달 클레임" },
      { order: 11, name: "프리랜서", description: "작가, 디자이너, 영상 제작자, 프리랜서 등이 겪는 문제 상황. 예시: 돈 떼먹는 클라이언트, 수정 무한 요청, 아이디어 도용" },
      { order: 12, name: "경찰", description: "경찰이 업무 중 겪는 문제 상황. 예시: 시민과의 마찰, 불필요한 신고, 내부 갈등" },
      { order: 13, name: "소방", description: "소방관이 업무 중 겪는 문제 상황. 예시: 허위 신고, 장비 부족, 위험한 출동 상황" },
      { order: 14, name: "군대", description: "군대에서 발생하는 문제 상황. 예시: 가혹 행위, 부조리, 무책임한 간부" }
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
    console.log('Fetching posts for userId:', userId); // 디버깅용
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    console.log('Found posts:', snapshot.size); // 디버깅용
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  export const getUserDoc = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const defaultUserData = {
          userId: userId,
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
      console.log('googleLogin 함수 시작');
      const provider = new GoogleAuthProvider();
      
      // 팝업 창이 차단되지 않도록 사용자에게 알림
      console.log('Google 로그인 팝업 열기 시도');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google 로그인 성공, 사용자 정보:', userCredential.user.uid);
      
      // 프로필 이미지 설정
      console.log('랜덤 프로필 이미지 가져오기 시도');
      const randomProfileUrl = await getRandomProfileImage();
      
      // 랜덤 사용자 이름 생성
      const username = generateRandomUsername(); // 형용사+명사 조합의 랜덤 이름 생성
      console.log('생성된 사용자 이름:', username);
      
      // 프로필 업데이트 (이름과 이미지 함께 설정)
      console.log('사용자 프로필 업데이트 시도');
      await updateProfile(userCredential.user, { 
        displayName: username, 
        photoURL: randomProfileUrl || userCredential.user.photoURL
      });
      console.log('사용자 프로필 업데이트 성공');
      
      // Firestore에 사용자 정보 저장
      console.log('Firestore에 사용자 정보 저장 시도');
      const userRef = doc(db, 'users', userCredential.user.uid);
      
      await setDoc(
        userRef,
        {
          email: userCredential.user.email,
          username: username,
          photoURL: randomProfileUrl || userCredential.user.photoURL,
          createdAt: new Date(),
          bio: '',
          userId: userCredential.user.uid
        },
        { merge: true }
      );
      console.log('Firestore 사용자 정보 저장 성공');
      
      return userCredential.user;
    } catch (error) {
      console.error('Google 로그인 실패 상세 정보:', error.code, error.message);
      // 팝업 차단 관련 오류 확인
      if (error.code === 'auth/popup-blocked') {
        console.error('팝업이 차단되었습니다. 브라우저 설정에서 팝업 허용을 확인해주세요.');
      }
      throw error;
    }
  };

  // 대댓글 추가
  export const addReply = async (postId, parentCommentId, replyContent) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const userDoc = await getUserDoc(user.uid);
      const reply = {
        content: replyContent,
        authorId: user.uid,
        authorName: userDoc.username || user.email || user.displayName,
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
      };
    } catch (error) {
      throw error;
    }
  };

  // 대댓글 목록 가져오기
  export const getReplies = async (parentCommentId) => {
    const q = query(
      collection(db, 'comments', parentCommentId, 'replies'),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  };

  // 게시글 수정
  export const updatePost = async (postId, updateData) => {
    try {
      // 현재 사용자 확인 (옵션)
      const user = auth.currentUser;
      const updateFields = { ...updateData };
      
      // 사용자가 로그인한 경우 프로필 사진 업데이트 (옵션)
      if (user && user.photoURL) {
        updateFields.authorPhotoURL = user.photoURL;
      }
      
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...updateFields,
        updatedAt: serverTimestamp()
      });
      
      // 업데이트된 게시글 데이터 반환
      const updatedPost = await getDoc(postRef);
      return {
        id: updatedPost.id,
        ...updatedPost.data()
      };
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  };

  // 대댓글 삭제
  export const deleteReply = async (postId, commentId, replyId) => {
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

  // 게시물/댓글 신고하기
  export const reportContent = async (type, contentId, userId, reason) => {
    try {
      const reportRef = collection(db, 'reports');
      const reportData = {
        type: type, // 'post' or 'comment' or 'reply'
        contentId: contentId,
        reporterId: userId,
        reason: reason,
        createdAt: serverTimestamp(),
        status: 'pending' // 'pending', 'reviewed', 'resolved'
      };
      
      await addDoc(reportRef, reportData);
    } catch (error) {
      console.error('신고 실패:', error);
      throw error;
    }
  };

  // 내가 신고한 게시물/댓글 목록 가져오기
  export const getMyReports = async (userId) => {
    try {
      const reportRef = collection(db, 'reports');
      const q = query(
        reportRef,
        where('reporterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      for (const doc of querySnapshot.docs) {
        const reportData = doc.data();
        // 신고된 컨텐츠의 실제 데이터 가져오기
        let contentData = null;
        
        if (reportData.type === 'post') {
          const postDoc = await getDoc(doc(db, 'posts', reportData.contentId));
          contentData = postDoc.data();
        } else if (reportData.type === 'comment') {
          const commentDoc = await getDoc(doc(db, 'comments', reportData.contentId));
          contentData = commentDoc.data();
        }
        
        reports.push({
          id: doc.id,
          ...reportData,
          content: contentData
        });
      }
      
      return reports;
    } catch (error) {
      console.error('신고 목록 가져오기 실패:', error);
      throw error;
    }
  };

  // 이미 신고한 컨텐츠인지 확인
  export const hasAlreadyReported = async (type, contentId, userId) => {
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

  // 포스트와 관련된 모든 댓글 삭제
  export const deletePost = async (postId) => {
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

    } catch (error) {
      console.error('포스트 삭제 실패:', error);
      throw error;
    }
  };

  // 반응 데이터 구조
  export const updateReaction = async (postId, userId, reaction) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const postData = postDoc.data();
      const reactions = postData.reactions || {};
      const userReaction = reactions[userId];

      // reaction이 null이거나 이미 같은 반응을 했다면 취소
      if (!reaction || userReaction?.id === reaction.id) {
        const updatedReactions = { ...reactions };
        delete updatedReactions[userId];
        
        await updateDoc(postRef, {
          reactions: updatedReactions,
          reactionCount: (postData.reactionCount || 0) - 1
        });

        return {
          reactions: updatedReactions,
          reactionCount: (postData.reactionCount || 0) - 1
        };
      }

      // 새로운 반응 추가
      const updatedReactions = {
        ...reactions,
        [userId]: {
          id: reaction.id,
          emoji: reaction.emoji,
          label: reaction.label,
          timestamp: serverTimestamp()
        }
      };

      await updateDoc(postRef, {
        reactions: updatedReactions,
        reactionCount: (postData.reactionCount || 0) + 1
      });

      // 새로운 반응 추가 시 알림 생성
      if (postData.authorId && postData.authorId !== userId) {
        try {
          await createNotification(
            'reaction',                   // 알림 타입
            postId,                       // 포스트 ID
            postData.authorId,            // 알림 수신자 (포스트 작성자)
            userId,                       // 알림 발신자 (반응을 누른 사용자)
            auth.currentUser?.displayName || '익명',  // 발신자 이름
            `${reaction.label} 반응을 남겼습니다.`    // 알림 내용
          );
        } catch (error) {
          console.error('반응 알림 생성 실패:', error);
        }
      }

      return {
        reactions: updatedReactions,
        reactionCount: (postData.reactionCount || 0) + 1
      };
    } catch (error) {
      console.error('반응 업데이트 실패:', error);
      throw error;
    }
  };

  // 게시글의 반응 데이터 가져오기
  export const getPostReactions = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      return postDoc.data().reactions || {};
    } catch (error) {
      console.error('반응 데이터 조회 실패:', error);
      throw error;
    }
  };
