const mongoose = require('mongoose');

const marketPriceCacheSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    commodity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    market: {
      type: String,
      trim: true,
      // Mandi name (e.g., "Azadpur", "Vashi")
    },
    district: {
      type: String,
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
      default: '',
    },
    minPrice: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
    modalPrice: {
      type: Number,
      default: 0,
      // Most common trading price for the day
    },
    arrivalDate: {
      type: String,
      trim: true,
    },
    cachedAt: {
      type: Date,
      default: Date.now,
      // TTL index removes documents 6 hours after caching
      expires: 21600, // 6 hours in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient state + commodity lookups
marketPriceCacheSchema.index({ state: 1, commodity: 1 });

const MarketPriceCache = mongoose.model('MarketPriceCache', marketPriceCacheSchema);

module.exports = MarketPriceCache;
