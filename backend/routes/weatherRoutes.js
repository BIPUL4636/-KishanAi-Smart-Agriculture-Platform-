const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/weather?city=Jaipur — fetches weather by city name (protected)
// GET /api/weather?lat=26.9&lon=75.7 — fetches weather by GPS coordinates (protected)
router.get('/', protect, getWeather);

module.exports = router;
