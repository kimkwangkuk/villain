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
app.use('/api/posts', postRouter);

const categoryRouter = require('./router/categoryRouter');
app.use('/api/categories', categoryRouter);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
}); 