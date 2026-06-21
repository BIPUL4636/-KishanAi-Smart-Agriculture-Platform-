const express = require('express');
const router = express.Router();
const { recommendCrop, getHistory } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/crop/recommend — sends soil data to ML service for crop recommendation (protected)
router.post('/recommend', protect, recommendCrop);

// GET /api/crop/history — returns user's crop recommendation history (protected)
router.get('/history', protect, getHistory);

module.exports = router;
