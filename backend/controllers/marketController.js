const marketService = require('../services/marketService');

// Fetches market prices filtered by state and commodity
const getMarketPrices = async (req, res, next) => {
  try {
    const { state, commodity } = req.query;

    // Validate required query parameters
    if (!state || !commodity) {
      res.status(400);
      throw new Error('Please provide both "state" and "commodity" query parameters');
    }

    // Validate that the state is a recognized Indian state
    const validStates = marketService.getStates();
    const matchedState = validStates.find(
      (s) => s.toLowerCase() === state.toLowerCase()
    );
    if (!matchedState) {
      res.status(400);
      throw new Error(
        `"${state}" is not a recognized Indian state. Use GET /api/market/states for the full list.`
      );
    }

    const result = await marketService.getMarketPrices(matchedState, commodity);

    // Return empty results with a helpful message instead of an error
    if (result.prices.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          prices: [],
          state: matchedState,
          commodity,
          source: result.source,
          totalRecords: 0,
        },
        message: `No market prices found for ${commodity} in ${matchedState}. This could mean no recent arrivals at mandis.`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        prices: result.prices,
        state: matchedState,
        commodity,
        source: result.source,
        totalRecords: result.totalRecords,
      },
      message: `Market prices for ${commodity} in ${matchedState} fetched successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Returns the list of all Indian states (public endpoint, no auth required)
const getStates = async (req, res, next) => {
  try {
    const states = marketService.getStates();
    const commodities = marketService.getDefaultCommodities();

    res.status(200).json({
      success: true,
      data: {
        states,
        defaultCommodities: commodities,
      },
      message: 'Indian states and default commodities list fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMarketPrices, getStates };
