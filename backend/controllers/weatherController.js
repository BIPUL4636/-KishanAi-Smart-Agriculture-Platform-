const weatherService = require('../services/weatherService');

// Fetches weather data by city name or GPS coordinates (lat/lon)
const getWeather = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    // Validate that either city or lat+lon is provided
    if (!city && (!lat || !lon)) {
      res.status(400);
      throw new Error(
        'Please provide a city name or latitude & longitude coordinates'
      );
    }

    // Validate lat/lon ranges if provided
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        res.status(400);
        throw new Error('Latitude must be between -90 and 90');
      }
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        res.status(400);
        throw new Error('Longitude must be between -180 and 180');
      }
    }

    const weatherData = await weatherService.getWeather({ city, lat, lon });

    res.status(200).json({
      success: true,
      data: weatherData,
      message: weatherData.fromCache
        ? 'Weather data fetched from cache'
        : 'Weather data fetched successfully',
    });
  } catch (error) {
    // Handle Agromonitoring API-specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        res.status(502);
        error.message = 'Weather service authentication failed — check API key';
      } else if (status === 404) {
        res.status(404);
        error.message = 'Location not found — please check the city name';
      } else if (status === 429) {
        res.status(429);
        error.message = 'Weather API rate limit exceeded — please try again later';
      }
    }
    next(error);
  }
};

module.exports = { getWeather };
