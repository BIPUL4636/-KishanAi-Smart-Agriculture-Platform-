const express = require('express');
const router = express.Router();
const { detectDisease, getHistory } = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');

// POST /api/disease/detect — uploads leaf image and detects disease (protected, multipart/form-data)
router.post('/detect', protect, handleUpload, detectDisease);

// GET /api/disease/history — returns user's disease detection history (protected)
router.get('/history', protect, getHistory);

module.exports = router;
