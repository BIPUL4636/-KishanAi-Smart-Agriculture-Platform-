const mlService = require('../services/mlService');
const CropRecommendation = require('../models/CropRecommendation');

// Sends soil & climate data to the ML service and returns a crop recommendation
const recommendCrop = async (req, res, next) => {
  try {
    const { N, P, K, temperature, humidity, pH, rainfall } = req.body;

    // Validate all 7 required input fields
    if (
      N === undefined || P === undefined || K === undefined ||
      temperature === undefined || humidity === undefined ||
      pH === undefined || rainfall === undefined
    ) {
      res.status(400);
      throw new Error(
        'All fields are required: N, P, K, temperature, humidity, pH, rainfall'
      );
    }

    // Validate numeric values and reasonable ranges
    const inputs = {
      N: parseFloat(N),
      P: parseFloat(P),
      K: parseFloat(K),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      pH: parseFloat(pH),
      rainfall: parseFloat(rainfall),
    };

    if (Object.values(inputs).some((v) => isNaN(v))) {
      res.status(400);
      throw new Error('All input values must be valid numbers');
    }

    if (inputs.pH < 0 || inputs.pH > 14) {
      res.status(400);
      throw new Error('pH value must be between 0 and 14');
    }

    if (inputs.humidity < 0 || inputs.humidity > 100) {
      res.status(400);
      throw new Error('Humidity must be between 0 and 100');
    }

    // Call Flask ML service for prediction
    const mlResult = await mlService.recommendCrop(inputs);

    // Save recommendation to user's history
    const recommendation = await CropRecommendation.create({
      user: req.user._id,
      inputs,
      result: {
        cropName: mlResult.crop || mlResult.cropName || 'Unknown',
        confidence: mlResult.confidence || 0,
        reasoning: mlResult.reasoning || mlResult.description || '',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        recommendation: {
          _id: recommendation._id,
          inputs: recommendation.inputs,
          result: recommendation.result,
          createdAt: recommendation.createdAt,
        },
      },
      message: `Recommended crop: ${recommendation.result.cropName}`,
    });
  } catch (error) {
    next(error);
  }
};

// Returns the authenticated user's crop recommendation history (newest first)
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [recommendations, total] = await Promise.all([
      CropRecommendation.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CropRecommendation.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message:
        recommendations.length > 0
          ? 'Crop recommendation history fetched successfully'
          : 'No crop recommendations yet — fill the soil form to get started',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendCrop, getHistory };
