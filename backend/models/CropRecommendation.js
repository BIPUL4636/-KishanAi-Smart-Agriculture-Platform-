const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Soil and climate input values provided by the farmer
    inputs: {
      N: { type: Number, required: true },       // Nitrogen content
      P: { type: Number, required: true },       // Phosphorus content
      K: { type: Number, required: true },       // Potassium content
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      pH: { type: Number, required: true },
      rainfall: { type: Number, required: true },
    },
    // Prediction result from the ML model
    result: {
      cropName: { type: String, required: true },
      confidence: { type: Number, required: true },
      reasoning: { type: String, default: '' },
    },
  },
  {
    timestamps: true, // createdAt is the recommendation date
  }
);

const CropRecommendation = mongoose.model('CropRecommendation', cropRecommendationSchema);

module.exports = CropRecommendation;
