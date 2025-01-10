const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, {
  collection: 'users'  // 실제 MongoDB의 컬렉션 이름과 일치하는지 확인
});

module.exports = mongoose.model('User', userSchema); 