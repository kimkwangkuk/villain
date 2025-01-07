const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터
const postRouter = require('./router/postRouter');
const categoryRouter = require('./router/categoryRouter');
const authRouter = require('./router/authRouter');

app.use('/api/posts', postRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/auth', authRouter);

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ 
    message: '서버 에러가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
    console.log('연결된 DB URI:', process.env.MONGODB_URI);
  })
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);  // 연결 실패시 서버 종료
  });

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
}); 