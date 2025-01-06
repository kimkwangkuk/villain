const mongoose = require('mongoose');

const VillainCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String
}, {
  collection: 'villainCategories'
});

module.exports = mongoose.model('VillainCategory', VillainCategorySchema); 