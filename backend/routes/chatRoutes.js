const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/chat — sends a message to AgriBot and returns AI response (protected)
router.post('/', protect, chat);

module.exports = router;
