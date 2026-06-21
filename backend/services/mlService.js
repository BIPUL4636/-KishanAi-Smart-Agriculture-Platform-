const axios = require('axios');
const FormData = require('form-data');

const ML_SERVICE_URL = () => process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Checks if the Flask ML microservice is online
const checkHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL()}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    throw new Error('ML service is currently unavailable. Please try again later.');
  }
};

// Sends soil and climate data to Flask and returns crop recommendation
const recommendCrop = async ({ N, P, K, temperature, humidity, pH, rainfall }) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL()}/recommend-crop`,
      { N, P, K, temperature, humidity, pH, rainfall },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000, // 30s timeout for model inference
      }
    );

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        'ML service is not running. Please start the Flask server on port 8000.'
      );
    }
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Crop recommendation failed — ML service error'
      );
    }
    throw new Error('Failed to connect to ML service for crop recommendation');
  }
};

// Sends a leaf image buffer to Flask and returns disease detection results
const detectDisease = async (imageBuffer, originalName) => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: originalName || 'leaf.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post(
      `${ML_SERVICE_URL()}/detect-disease`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60s timeout — image processing takes longer
        maxContentLength: 10 * 1024 * 1024, // 10MB
      }
    );

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        'ML service is not running. Please start the Flask server on port 8000.'
      );
    }
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Disease detection failed — ML service error'
      );
    }
    throw new Error('Failed to connect to ML service for disease detection');
  }
};

module.exports = { checkHealth, recommendCrop, detectDisease };
