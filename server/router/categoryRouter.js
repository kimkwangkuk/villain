const express = require('express');
const router = express.Router();
const VillainCategory = require('../models/VillainCategory');

// 모든 카테고리 가져오기
router.get('/', async (req, res) => {
  try {
    const categories = await VillainCategory.find();
    console.log('카회된 카테고리:', categories);
    res.json(categories);
  } catch (error) {
    console.error('카테고리 조회 에러:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 