const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('디코딩된 토큰:', decoded);

    // 토큰에서 추출한 사용자 정보를 req.user에 저장
    req.user = {
      _id: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    
    console.log('설정된 req.user:', req.user);
    next();
  } catch (error) {
    console.error('토큰 검증 에러:', error);
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authenticateToken; 