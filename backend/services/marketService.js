const axios = require('axios');
const MarketPriceCache = require('../models/MarketPriceCache');

const DATA_GOV_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// List of all Indian states and UTs for the /states endpoint
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// Default commodities tracked by KishanAi
const DEFAULT_COMMODITIES = [
  'Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Maize', 'Cotton', 'Soybean',
];

// Returns cached market prices from MongoDB if they exist and are within TTL
const getCachedPrices = async (state, commodity) => {
  const sixHoursAgo = new Date(Date.now() - CACHE_TTL_MS);

  const cached = await MarketPriceCache.find({
    state: { $regex: new RegExp(`^${state}$`, 'i') },
    commodity: { $regex: new RegExp(`^${commodity}$`, 'i') },
    cachedAt: { $gte: sixHoursAgo },
  })
    .sort({ modalPrice: -1 })
    .lean();

  return cached.length > 0 ? cached : null;
};

// Saves fetched market price records to MongoDB for caching
const cachePrices = async (prices, state, commodity) => {
  // Remove old cached entries for this state+commodity before inserting fresh data
  await MarketPriceCache.deleteMany({
    state: { $regex: new RegExp(`^${state}$`, 'i') },
    commodity: { $regex: new RegExp(`^${commodity}$`, 'i') },
  });

  if (prices.length > 0) {
    await MarketPriceCache.insertMany(prices);
  }
};

// Fetches live market prices from data.gov.in Agmarknet API
const fetchFromAPI = async (state, commodity) => {
  try {
    const response = await axios.get(DATA_GOV_BASE, {
      params: {
        'api-key': process.env.AGMARKNET_API_KEY,
        format: 'json',
        limit: 100,
        'filters[state.keyword]': state,
        'filters[commodity]': commodity,
      },
      timeout: 15000, // 15-second timeout for government APIs
    });

    const records = response.data?.records || [];

    if (records.length === 0) {
      return [];
    }

    // Map API response fields to our schema
    return records.map((record) => ({
      state: record.state || state,
      commodity: record.commodity || commodity,
      market: record.market || '',
      district: record.district || '',
      variety: record.variety || '',
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      arrivalDate: record.arrival_date || '',
      cachedAt: new Date(),
    }));
  } catch (error) {
    // If the government API is down, return empty rather than crashing
    console.error('Agmarknet API error:', error.message);
    return [];
  }
};

// Main function — returns market prices with MongoDB cache layer
const getMarketPrices = async (state, commodity) => {
  // Check MongoDB cache first
  const cached = await getCachedPrices(state, commodity);
  if (cached) {
    return {
      prices: cached.map(formatPriceRecord),
      source: 'cache',
      totalRecords: cached.length,
    };
  }

  // Fetch fresh data from API
  const freshPrices = await fetchFromAPI(state, commodity);

  // Cache the results in MongoDB (even if empty, to prevent re-fetching)
  if (freshPrices.length > 0) {
    await cachePrices(freshPrices, state, commodity);
  }

  return {
    prices: freshPrices.map(formatPriceRecord),
    source: 'api',
    totalRecords: freshPrices.length,
  };
};

// Formats a price record for the API response (cleans up internal fields)
const formatPriceRecord = (record) => ({
  state: record.state,
  commodity: record.commodity,
  market: record.market,
  district: record.district,
  variety: record.variety,
  minPrice: record.minPrice,
  maxPrice: record.maxPrice,
  modalPrice: record.modalPrice,
  arrivalDate: record.arrivalDate,
});

// Returns the list of all Indian states
const getStates = () => INDIAN_STATES;

// Returns the default tracked commodity list
const getDefaultCommodities = () => DEFAULT_COMMODITIES;

module.exports = { getMarketPrices, getStates, getDefaultCommodities };
