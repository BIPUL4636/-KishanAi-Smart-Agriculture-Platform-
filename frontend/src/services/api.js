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

// Sends soil data for crop prediction
export const recommendCrop = (data) => api.post('/crop/recommend', data);

// Fetches user's crop recommendation history
export const getCropHistory = (page = 1, limit = 10) =>
  api.get(`/crop/history?page=${page}&limit=${limit}`);

// ----- Disease Detection API -----

// Uploads a leaf image for disease detection (multipart form data)
export const detectDisease = (formData) =>
  api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Longer timeout for image processing
  });

// Fetches user's disease detection history
export const getDiseaseHistory = (page = 1, limit = 10) =>
  api.get(`/disease/history?page=${page}&limit=${limit}`);

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
