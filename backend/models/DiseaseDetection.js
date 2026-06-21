const mongoose = require('mongoose');

const diseaseDetectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Path to the uploaded leaf image on the server
    imagePath: {
      type: String,
      required: true,
    },
    // Original filename for display purposes
    originalName: {
      type: String,
      default: '',
    },
    // Detection result from the MobileNetV2 model
    result: {
      diseaseName: { type: String, required: true },
      confidence: { type: Number, required: true },
      symptoms: { type: String, default: '' },
      treatment: { type: String, default: '' },
      isHealthy: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const DiseaseDetection = mongoose.model('DiseaseDetection', diseaseDetectionSchema);

module.exports = DiseaseDetection;
