import axios from 'axios';
import toast from 'react-hot-toast';

// Axios instance configured for the KishanAi backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Direct ML Service Axios client using the VITE_ML_URL environment variable
console.log('[KishanAi] VITE_ML_URL:', import.meta.env.VITE_ML_URL);
export const mlApi = axios.create({
  baseURL: import.meta.env.VITE_ML_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor — attaches JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kishanai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles 401 (expired token) and shows error toasts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Auto-logout on token expiry or unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('kishanai_token');
      localStorage.removeItem('kishanai_user');

      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        toast.error('Session expired — please log in again');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ----- Auth API -----

// Registers a new user account
export const registerUser = (data) => api.post('/auth/register', data);

// Logs in a user and returns JWT token
export const loginUser = (data) => api.post('/auth/login', data);

// Fetches the authenticated user's profile
export const getMe = () => api.get('/auth/me');

// ----- Crop Recommendation API -----

// Sends soil data for crop prediction directly to the ML service (pins to VITE_ML_URL)
export const recommendCrop = async (data) => {
  // Call the Flask/TFLite ML service directly
  const response = await mlApi.post('/recommend-crop', data);
  
  // Call the backend API in the background to save the recommendation to history
  api.post('/crop/recommend', data).catch(() => {});

  // Format the response structure so it matches exactly what the frontend pages expect
  return {
    data: {
      success: true,
      data: {
        recommendation: {
          result: {
            cropName: response.data.crop || response.data.cropName || 'Unknown',
            confidence: response.data.confidence || 0,
            reasoning: response.data.reasoning || response.data.description || '',
          },
          inputs: data,
          createdAt: new Date().toISOString(),
        }
      }
    }
  };
};

// Fetches user's crop recommendation history
export const getCropHistory = (page = 1, limit = 10) =>
  api.get(`/crop/history?page=${page}&limit=${limit}`);

// ----- Disease Detection API -----

// Uploads a leaf image for disease detection directly to the ML service (pins to VITE_ML_URL)
export const detectDisease = async (formData) => {
  // Call the Flask/TFLite ML service directly
  const response = await mlApi.post('/detect-disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

  // Call the backend API in the background to save the detection to history
  api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).catch(() => {});

  const confidence = response.data.confidence || 0;
  const isLowConfidence = confidence < 60;
  
  // Format the response structure so it matches exactly what the frontend pages expect
  return {
    data: {
      success: true,
      data: {
        detection: {
          result: {
            diseaseName: isLowConfidence ? 'Unclear' : (response.data.diseaseName || response.data.disease || 'Unknown'),
            confidence,
            symptoms: isLowConfidence ? 'Image unclear — could not reliably identify the disease.' : (response.data.symptoms || ''),
            treatment: isLowConfidence ? 'Please retake the photo in good natural lighting with the affected leaf area clearly visible.' : (response.data.treatment || ''),
            isHealthy: response.data.isHealthy || false,
          },
          createdAt: new Date().toISOString(),
        },
        isLowConfidence,
      }
    }
  };
};

// Fetches user's disease detection history
export const getDiseaseHistory = (page = 1, limit = 10) =>
  api.get(`/disease/history?page=${page}&limit=${limit}`);

// Checks the health of the ML service directly
export const checkMLHealth = () => mlApi.get('/health');

// ----- Fertilizer API -----

// Gets fertilizer suggestions based on crop and NPK values
export const suggestFertilizer = (data) => api.post('/fertilizer/suggest', data);

// ----- Weather API -----

// Fetches weather by city name
export const getWeatherByCity = (city) => api.get(`/weather?city=${encodeURIComponent(city)}`);

// Fetches weather by GPS coordinates
export const getWeatherByCoords = (lat, lon) => api.get(`/weather?lat=${lat}&lon=${lon}`);

// ----- Market Prices API -----

// Fetches market prices filtered by state and commodity
export const getMarketPrices = (state, commodity) =>
  api.get(`/market?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`);

// Fetches list of Indian states and default commodities
export const getMarketStates = () => api.get('/market/states');

// ----- Chat / AgriBot API -----

// Sends a message to AgriBot
export const sendChatMessage = (message, history = []) =>
  api.post('/chat', { message, history });

export default api;
