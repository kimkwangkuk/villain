const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    console.log('회원가입 요청 데이터:', { email, username });  // 비밀번호는 로깅하지 않음

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용중인 이메일입니다.' });
    }

    // 사용자명 중복 체크 추가
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: '이미 사용중인 사용자 이름입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 유저 생성
    const user = new User({
      email,
      username,
      password: hashedPassword
    });

    console.log('생성할 유저 정보:', user);  // 해시된 비밀번호 포함

    await user.save();
    console.log('유저 저장 완료');

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('회원가입 에러:', error);  // 상세 에러 로깅
    res.status(500).json({ 
      message: '회원가입 처리 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('로그인 시도:', { email });  // 비밀번호는 로깅하지 않음

    // 유저 찾기
    const user = await User.findOne({ email });
    if (!user) {
      console.log('사용자를 찾을 수 없음:', email);
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('비밀번호 불일치:', email);
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    console.log('로그인 성공:', email);

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ 
      message: '로그인 처리 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

module.exports = router; 