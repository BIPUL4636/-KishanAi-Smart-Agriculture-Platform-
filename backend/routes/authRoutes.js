const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register — creates a new user account
router.post('/register', register);

// POST /api/auth/login — authenticates user and returns JWT
router.post('/login', login);

// GET /api/auth/me — returns the authenticated user's profile (protected)
router.get('/me', protect, getMe);

module.exports = router;
