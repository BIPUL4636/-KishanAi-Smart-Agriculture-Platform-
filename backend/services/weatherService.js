const axios = require('axios');

const AGROMONITORING_BASE = 'http://api.agromonitoring.com/agro/1.0';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Converts Kelvin to Celsius (Agromonitoring returns Kelvin)
const kelvinToCelsius = (k) => Math.round(k - 273.15);

// In-memory cache to avoid hitting Agromonitoring API on every request
const weatherCache = new Map();

// Generates a cache key from latitude and longitude (rounded to 2 decimals for nearby-location grouping)
const getCacheKey = (lat, lon) => `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;

// Returns cached data if it exists and hasn't expired, otherwise null
const getFromCache = (key) => {
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  weatherCache.delete(key);
  return null;
};

// Stores weather data in cache with a timestamp
const setCache = (key, data) => {
  weatherCache.set(key, { data, timestamp: Date.now() });
};

// Converts a city name to lat/lon coordinates using Open-Meteo Geocoding API (free, no key required)
const getCoordinatesByCity = async (city) => {
  const response = await axios.get(`${GEOCODING_BASE}/search`, {
    params: {
      name: city,
      count: 5,
      language: 'en',
      format: 'json',
    },
  });

  if (!response.data?.results || response.data.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check the spelling.`);
  }

  // Prefer Indian results for relevance to KishanAi
  const indian = response.data.results.find((r) => r.country_code === 'IN');
  const best = indian || response.data.results[0];

  return {
    lat: best.latitude,
    lon: best.longitude,
    name: best.name,
    state: best.admin1 || '',
  };
};

// Fetches current weather conditions for given coordinates (Agromonitoring returns Kelvin)
const fetchCurrentWeather = async (lat, lon) => {
  const response = await axios.get(`${AGROMONITORING_BASE}/weather`, {
    params: {
      lat,
      lon,
      appid: process.env.AGROMONITORING_API_KEY,
    },
  });

  const { main, weather, wind, clouds } = response.data;

  return {
    city: '',
    temperature: kelvinToCelsius(main.temp),
    feelsLike: kelvinToCelsius(main.feels_like),
    tempMin: kelvinToCelsius(main.temp_min),
    tempMax: kelvinToCelsius(main.temp_max),
    humidity: main.humidity,
    pressure: main.pressure,
    description: weather[0]?.description || '',
    icon: weather[0]?.icon || '',
    windSpeed: wind.speed,
    windDeg: wind.deg,
    clouds: clouds.all,
  };
};

// Fetches 5-day / 3-hour forecast and extracts one entry per day (noon readings)
const fetchForecast = async (lat, lon) => {
  const response = await axios.get(`${AGROMONITORING_BASE}/weather/forecast`, {
    params: {
      lat,
      lon,
      appid: process.env.AGROMONITORING_API_KEY,
    },
  });

  // Agromonitoring returns a flat array (no .list wrapper, no dt_txt — uses dt unix timestamp)
  const entries = response.data;

  // Group by date and pick the noon (12:00) reading for each day
  const dailyMap = new Map();

  entries.forEach((entry) => {
    const d = new Date(entry.dt * 1000);
    const date = d.toISOString().split('T')[0];
    const hour = d.getUTCHours();

    // Prefer the 12:00 reading, or keep the first one for that day
    if (!dailyMap.has(date) || hour === 12) {
      dailyMap.set(date, {
        date,
        temperature: kelvinToCelsius(entry.main.temp),
        tempMin: kelvinToCelsius(entry.main.temp_min),
        tempMax: kelvinToCelsius(entry.main.temp_max),
        humidity: entry.main.humidity,
        description: entry.weather[0]?.description || '',
        icon: entry.weather[0]?.icon || '',
        windSpeed: entry.wind.speed,
      });
    }
  });

  // Return next 5 days (skip today if it's already past noon)
  return Array.from(dailyMap.values()).slice(0, 5);
};

// Generates practical farming advice based on current weather conditions
const generateFarmingAdvice = (current) => {
  const advice = [];

  // Temperature-based advice
  if (current.temperature > 40) {
    advice.push('🔥 Extreme heat — irrigate crops early morning or late evening to reduce evaporation.');
  } else if (current.temperature > 35) {
    advice.push('☀️ High temperature — ensure adequate mulching to retain soil moisture.');
  } else if (current.temperature < 10) {
    advice.push('❄️ Cold conditions — protect sensitive crops with covers or straw mulch.');
  }

  // Humidity-based advice
  if (current.humidity > 80) {
    advice.push('💧 High humidity — watch for fungal diseases like blight and mildew. Consider fungicide spray.');
  } else if (current.humidity < 30) {
    advice.push('🏜️ Very low humidity — increase irrigation frequency to prevent crop wilting.');
  }

  // Wind-based advice
  if (current.windSpeed > 10) {
    advice.push('💨 Strong winds — avoid spraying pesticides today. Secure young plants with stakes.');
  }

  // Rain/cloud-based advice
  if (current.description.includes('rain') || current.description.includes('drizzle')) {
    advice.push('🌧️ Rainy conditions — postpone fertilizer application to prevent nutrient wash-off.');
  } else if (current.description.includes('thunderstorm')) {
    advice.push('⛈️ Thunderstorm expected — secure farm equipment and avoid open fields.');
  } else if (current.clouds < 20 && current.temperature > 30) {
    advice.push('☀️ Clear skies with heat — good day for harvesting and drying crops.');
  }

  // Default advice if nothing specific
  if (advice.length === 0) {
    advice.push('✅ Weather conditions are favorable for most farming activities.');
  }

  return advice;
};

// Main function — fetches weather by city name or lat/lon, with 30-min caching
const getWeather = async ({ city, lat, lon }) => {
  // Resolve coordinates from city name if lat/lon not provided
  let location = {};
  if (city && (!lat || !lon)) {
    location = await getCoordinatesByCity(city);
    lat = location.lat;
    lon = location.lon;
  }

  // Check cache before making API calls
  const cacheKey = getCacheKey(lat, lon);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  // Fetch current weather and forecast in parallel
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(lat, lon),
    fetchForecast(lat, lon),
  ]);

  // Override city name with geocoded name if available
  if (location.name) {
    current.city = location.name;
  }

  const farmingAdvice = generateFarmingAdvice(current);

  const weatherData = {
    current,
    forecast,
    farmingAdvice,
    location: {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      state: location.state || '',
    },
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };

  // Store in cache
  setCache(cacheKey, weatherData);

  return weatherData;
};

module.exports = { getWeather };
