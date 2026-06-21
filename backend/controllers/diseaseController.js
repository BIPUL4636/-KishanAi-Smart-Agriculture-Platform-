const fs = require('fs');
const path = require('path');
const mlService = require('../services/mlService');
const DiseaseDetection = require('../models/DiseaseDetection');

// Accepts a leaf image upload, sends it to the ML service, and returns disease detection results
const detectDisease = async (req, res, next) => {
  try {
    // Validate that an image was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a leaf image for disease detection');
    }

    // Read the uploaded image file into a buffer for forwarding to Flask
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const originalName = req.file.originalname;

    // Call Flask ML service for disease detection
    const mlResult = await mlService.detectDisease(imageBuffer, originalName);

    // Check confidence threshold — if below 60%, suggest retaking the photo
    const confidence = mlResult.confidence || 0;
    const isLowConfidence = confidence < 60;

    // Build the result object
    const result = {
      diseaseName: isLowConfidence
        ? 'Unclear'
        : mlResult.disease || mlResult.diseaseName || 'Unknown',
      confidence,
      symptoms: isLowConfidence
        ? 'Image unclear — could not reliably identify the disease.'
        : mlResult.symptoms || '',
      treatment: isLowConfidence
        ? 'Please retake the photo in good natural lighting with the affected leaf area clearly visible.'
        : mlResult.treatment || '',
      isHealthy: mlResult.isHealthy || false,
    };

    // Store the relative path for serving via static files
    const relativePath = path.relative(
      path.join(__dirname, '..'),
      imagePath
    ).replace(/\\/g, '/');

    // Save detection result to user's history
    const detection = await DiseaseDetection.create({
      user: req.user._id,
      imagePath: relativePath,
      originalName,
      result,
    });

    res.status(200).json({
      success: true,
      data: {
        detection: {
          _id: detection._id,
          imagePath: relativePath,
          originalName,
          result: detection.result,
          createdAt: detection.createdAt,
        },
        isLowConfidence,
      },
      message: isLowConfidence
        ? 'Image unclear — please retake in good lighting for accurate results'
        : result.isHealthy
          ? 'Great news! Your plant leaf appears healthy 🌿'
          : `Disease detected: ${result.diseaseName}`,
    });
  } catch (error) {
    next(error);
  }
};

// Returns the authenticated user's disease detection history (newest first)
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [detections, total] = await Promise.all([
      DiseaseDetection.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DiseaseDetection.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        detections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message:
        detections.length > 0
          ? 'Disease detection history fetched successfully'
          : 'No disease detections yet — upload a leaf photo to get started',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { detectDisease, getHistory };
