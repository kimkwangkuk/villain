const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require(path.join(__dirname, '..', 'models', 'Post'));
const Comment = require(path.join(__dirname, '..', 'models', 'Comment'));

// 모든 포스트 가져오기
router.get('/', async (req, res) => {
  try {
    console.log('포스트 조회 시작');
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log('조회된 포스트:', posts);
    res.json(posts);
  } catch (error) {
    console.error('포스트 조회 에러의 전체 내용:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 새 포스트 작성
router.post('/', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    category: req.body.categoryId,
    likes: 0
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 댓글 추가
router.post('/:id/comments', async (req, res) => {
  try {
    // 새 댓글 생성
    const comment = new Comment({
      content: req.body.content,    // text -> content
      userId: req.body.userId,      // author -> userId
      postId: req.params.id         // post -> postId
    });
    
    // 댓글 저장
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 좋아요 업데이트
router.patch('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes += 1;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 단일 포스트 조회
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    const comments = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: -1 });

    const response = post.toObject();
    response.comments = comments;

    res.json(response);
  } catch (err) {
    console.error('에러:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;