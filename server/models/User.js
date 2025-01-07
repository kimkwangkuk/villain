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
  collection: 'users'  // 기존 컬렉션 이름과 매칭
});

module.exports = mongoose.model('User', userSchema); 