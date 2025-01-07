const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VillainCategory',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'posts'
});

module.exports = mongoose.model('Post', PostSchema);