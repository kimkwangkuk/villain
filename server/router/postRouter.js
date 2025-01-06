const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require(path.join(__dirname, '..', 'models', 'Post'));
const Comment = require(path.join(__dirname, '..', 'models', 'Comment'));

// 모든 포스트 가져오기 (댓글 포함)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('comments');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 새 포스트 작성
router.post('/', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
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
    const post = await Post.findById(req.params.id);
    
    // 새 댓글 생성
    const comment = new Comment({
      text: req.body.text,
      author: req.body.author,
      post: post._id
    });
    
    // 댓글 저장
    const savedComment = await comment.save();
    
    // 포스트에 댓글 ID 추가
    post.comments.push(savedComment._id);
    const updatedPost = await post.save();
    
    // populate로 댓글 정보 포함해서 응답
    const populatedPost = await Post.findById(updatedPost._id).populate('comments');
    res.json(populatedPost);
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
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;