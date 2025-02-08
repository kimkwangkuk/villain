const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어
const isDev = process.env.NODE_ENV === 'development';
app.use(cors({
  origin: isDev 
    ? 'http://localhost:3000'  // 개발 환경
    : 'https://villain-5f05a.web.app'  // 배포 환경
}));
app.use(express.json());

// 라우터
const postRouter = require('./router/postRouter');
const categoryRouter = require('./router/categoryRouter');
const authRouter = require('./router/authRouter');

app.use('/api/posts', postRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/auth', authRouter);

// 먼저 firebase.js에서 createNotification 함수를 가져옵니다.
const { updateCommentLikes, createNotification } = require('../api/firebase');

// 댓글 좋아요 업데이트 엔드포인트 (예시)
app.patch('/api/comments/:commentId/like', async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;  // 좋아요를 누른 사용자의 ID 전달
  console.log('댓글 좋아요 업데이트 요청:', { commentId, userId });
  try {
    // 댓글 좋아요 상태 업데이트
    const updatedComment = await updateCommentLikes(commentId, userId);
    console.log('댓글 좋아요 업데이트 성공:', updatedComment);
    
    // 만약 댓글 작성자와 좋아요를 누른 사용자가 다르다면 알림 생성 (예시)
    if (updatedComment.userId && updatedComment.userId !== userId) {
      // createNotification(알림타입, 포스트ID, 수신자ID, 발신자ID, 발신자명, 추가 내용)
      await createNotification(
        'like',
        updatedComment.postId,           // 알림과 연관된 포스트 ID 
        updatedComment.userId,             // 댓글 작성자(알림 받는 사용자)
        userId,                          // 좋아요를 누른 사용자(알림 보낸 사용자)
        req.body.userName || '익명',      // 사용자 이름 (필요 시 클라이언트에서 전달)
        '댓글에 좋아요를 눌렀습니다.'
      );
    }
    
    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ 
    message: '서버 에러가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
}); 