const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Sends a chat completion request to Groq API (llama-3.3-70b-versatile)
const callGroq = async (messages, options = {}) => {
  const response = await axios.post(
    GROQ_API_URL,
    {
      model: options.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
      top_p: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0]?.message?.content || '';
};

// Sends a request to Gemini API as fallback when Groq is unavailable
const callGemini = async (messages, options = {}) => {
  // Convert OpenAI-style messages to Gemini format
  const systemInstruction = messages.find((m) => m.role === 'system')?.content || '';
  const conversationParts = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }] }
        : undefined,
      contents: conversationParts,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1024,
        topP: 0.9,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// Main function — tries Groq first, falls back to Gemini on failure
const sendMessage = async (messages, options = {}) => {
  // Attempt Groq (primary)
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }
    const response = await callGroq(messages, options);
    return { response, provider: 'groq' };
  } catch (groqError) {
    console.warn('⚠️ Groq API failed, falling back to Gemini:', groqError.message);
  }

  // Attempt Gemini (fallback)
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    const response = await callGemini(messages, options);
    return { response, provider: 'gemini' };
  } catch (geminiError) {
    console.error('❌ Gemini API also failed:', geminiError.message);
    throw new Error(
      'AI service is currently unavailable. Both Groq and Gemini failed. Please try again later.'
    );
  }
};

// Generates a natural language explanation for fertilizer recommendations
const enhanceFertilizerAdvice = async (lookupResult) => {
  const { crop, soilAnalysis, suggestions, cropSpecific } = lookupResult;

  const systemPrompt = `You are KisanAI's agriculture expert assistant. You explain fertilizer recommendations in simple, practical language that Indian farmers can understand. Mix Hindi farming terms naturally (like "khet", "fasal", "mitti") but write in English. Keep it concise — max 200 words.`;

  const userPrompt = `A farmer is growing ${crop}. Their soil test shows:
- Nitrogen (N): ${soilAnalysis.N.value} (${soilAnalysis.N.status})
- Phosphorus (P): ${soilAnalysis.P.value} (${soilAnalysis.P.status})
- Potassium (K): ${soilAnalysis.K.value} (${soilAnalysis.K.status})

Recommended fertilizers: ${suggestions.map((s) => s.fertilizer).join(', ')}
${cropSpecific ? `Crop note: ${cropSpecific.note}` : ''}

Explain this recommendation in simple, actionable language. Include:
1. What the soil needs
2. Which fertilizer to use and how much
3. When and how to apply it
4. One practical tip for better results`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const { response, provider } = await sendMessage(messages, {
    temperature: 0.6,
    maxTokens: 512,
  });

  return { explanation: response, provider };
};

module.exports = { sendMessage, enhanceFertilizerAdvice };
