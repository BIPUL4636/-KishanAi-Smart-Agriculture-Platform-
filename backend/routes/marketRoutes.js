const express = require('express');
const router = express.Router();
const { getMarketPrices, getStates } = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/market/states — returns list of Indian states + default commodities (public)
router.get('/states', getStates);

// GET /api/market?state=Rajasthan&commodity=Wheat — fetches mandi prices (protected)
router.get('/', protect, getMarketPrices);

module.exports = router;
