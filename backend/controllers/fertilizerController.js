const { lookupFertilizer } = require('../utils/fertiliserLookup');
const { enhanceFertilizerAdvice } = require('../services/groqService');

// Suggests fertilizers based on crop name and NPK values, enhanced with AI explanation
const suggestFertilizer = async (req, res, next) => {
  try {
    const { cropName, N, P, K } = req.body;

    // Validate required fields
    if (!cropName || N === undefined || P === undefined || K === undefined) {
      res.status(400);
      throw new Error('Please provide cropName, N, P, and K values');
    }

    // Parse and validate numeric values
    const nVal = parseFloat(N);
    const pVal = parseFloat(P);
    const kVal = parseFloat(K);

    if (isNaN(nVal) || isNaN(pVal) || isNaN(kVal)) {
      res.status(400);
      throw new Error('N, P, and K values must be valid numbers');
    }

    if (nVal < 0 || pVal < 0 || kVal < 0) {
      res.status(400);
      throw new Error('N, P, and K values cannot be negative');
    }

    // Get rule-based fertilizer recommendations
    const lookupResult = lookupFertilizer(cropName, nVal, pVal, kVal);

    // Enhance with AI-generated natural language explanation
    let aiExplanation = null;
    let aiProvider = null;
    try {
      const enhanced = await enhanceFertilizerAdvice(lookupResult);
      aiExplanation = enhanced.explanation;
      aiProvider = enhanced.provider;
    } catch (aiError) {
      // AI enhancement is optional — log and continue with rule-based results
      console.warn('⚠️ AI enhancement unavailable:', aiError.message);
      aiExplanation = null;
    }

    res.status(200).json({
      success: true,
      data: {
        crop: lookupResult.crop,
        soilAnalysis: lookupResult.soilAnalysis,
        deficiencies: lookupResult.deficiencies,
        suggestions: lookupResult.suggestions,
        cropSpecific: lookupResult.cropSpecific,
        aiExplanation,
        aiProvider,
      },
      message: `Fertilizer suggestions for ${cropName} generated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { suggestFertilizer };
