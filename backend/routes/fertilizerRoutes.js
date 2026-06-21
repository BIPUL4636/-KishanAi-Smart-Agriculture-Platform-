const express = require('express');
const router = express.Router();
const { suggestFertilizer } = require('../controllers/fertilizerController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/fertilizer/suggest — returns fertilizer recommendations based on crop + NPK (protected)
router.post('/suggest', protect, suggestFertilizer);

module.exports = router;
