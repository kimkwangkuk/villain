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

// 댓글 좋아요 업데이트 엔드포인트 (예시)
app.patch('/api/comments/:commentId/like', async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;  // 클라이언트에서 좋아요를 누른 사용자의 ID 전달
  try {
    // updateCommentLikes를 호출하여 댓글 좋아요 상태 업데이트 (firebase.js의 함수 사용)
    const updatedComment = await updateCommentLikes(commentId, userId);
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