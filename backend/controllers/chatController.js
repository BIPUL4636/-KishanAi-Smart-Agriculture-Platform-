const { sendMessage } = require('../services/groqService');
const CropRecommendation = require('../models/CropRecommendation');
const DiseaseDetection = require('../models/DiseaseDetection');

// Base system prompt defining AgriBot's personality and boundaries
const BASE_SYSTEM_PROMPT = `You are KisanAI's agriculture assistant — a helpful, friendly expert on Indian farming. Your name is AgriBot.

Rules:
- Answer questions about farming, crops, diseases, fertilizers, weather, and market prices.
- Use simple English. Mix common Hindi farming terms naturally (e.g., "khet", "fasal", "mitti", "khad", "sinchai", "mandi").
- Keep answers practical, actionable, and short (under 200 words).
- If a farmer asks about something dangerous or outside farming (medical, legal, financial), politely redirect: "Main sirf kheti se jude sawaalon mein madad kar sakta hoon."
- Use bullet points for step-by-step advice.
- When discussing prices, mention that mandi rates change daily and suggest checking the Market Prices section.
- Be encouraging and supportive — farming is hard work.`;

// Fetches the user's latest crop recommendation and disease detection for context
const getUserContext = async (userId) => {
  const [lastCrop, lastDisease] = await Promise.all([
    CropRecommendation.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean(),
    DiseaseDetection.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  let context = '';

  if (lastCrop) {
    context += `\n\nUser's latest crop recommendation: ${lastCrop.result.cropName} (confidence: ${lastCrop.result.confidence}%). Soil values — N: ${lastCrop.inputs.N}, P: ${lastCrop.inputs.P}, K: ${lastCrop.inputs.K}, pH: ${lastCrop.inputs.pH}, temperature: ${lastCrop.inputs.temperature}°C, humidity: ${lastCrop.inputs.humidity}%, rainfall: ${lastCrop.inputs.rainfall}mm.`;
  }

  if (lastDisease) {
    context += `\n\nUser's latest disease detection: ${lastDisease.result.diseaseName} (confidence: ${lastDisease.result.confidence}%). ${lastDisease.result.isHealthy ? 'The plant was healthy.' : `Symptoms: ${lastDisease.result.symptoms}`}`;
  }

  if (context) {
    context = `\n\n--- User's farming context (use this to personalize your answers) ---${context}`;
  }

  return context;
};

// Handles incoming chat messages — builds context-aware system prompt and calls AI
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400);
      throw new Error('Please provide a message to chat with AgriBot');
    }

    if (message.trim().length > 2000) {
      res.status(400);
      throw new Error('Message is too long — please keep it under 2000 characters');
    }

    // Fetch user's farming context for personalized responses
    const userContext = await getUserContext(req.user._id);

    // Build the full system prompt with user context
    const systemPrompt = BASE_SYSTEM_PROMPT + userContext;

    // Build conversation messages array
    const messages = [{ role: 'system', content: systemPrompt }];

    // Include conversation history if provided (last 10 messages to stay within token limits)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg) => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      });
    }

    // Add the current user message
    messages.push({ role: 'user', content: message.trim() });

    // Call AI service (Groq → Gemini fallback)
    const { response, provider } = await sendMessage(messages, {
      temperature: 0.7,
      maxTokens: 768,
    });

    res.status(200).json({
      success: true,
      data: {
        reply: response,
        provider,
      },
      message: 'AgriBot response generated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };
