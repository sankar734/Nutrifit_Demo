const OpenAI = require('openai');

// Groq Client Initialization (OpenAI-compatible)
let groqClient = null;
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
};

// Priority list of Groq models supported for this key
const CANDIDATE_GROQ_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'allam-2-7b',
].filter(Boolean);

let activeGroqModelName = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// Resilient Groq text generation with automatic model fallback
const executeGroqGeneration = async (messages, maxTokens = 800) => {
  const client = getGroqClient();
  if (!client) return null;

  const modelsToTry = [
    activeGroqModelName,
    ...CANDIDATE_GROQ_MODELS.filter((m) => m !== activeGroqModelName),
  ];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      const text = completion.choices?.[0]?.message?.content;
      if (text) {
        if (activeGroqModelName !== model) {
          console.log(`[AI Service] Successfully switched active Groq model to: ${model}`);
          activeGroqModelName = model;
        }
        return { text, model, provider: 'groq' };
      }
    } catch (err) {
      console.warn(`[AI Service] Groq model ${model} error: ${err.message?.substring(0, 100)}`);
      lastError = err;
    }
  }

  console.error('[AI Service] All Groq candidate models failed:', lastError?.message);
  return null;
};

// Priority list of Gemini models supported for this key
const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
].filter(Boolean);

let activeGeminiModelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
let genAIInstance = null;

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIInstance) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAIInstance;
};

// Resilient Gemini text generation with automatic model fallback
const executeGeminiGeneration = async (prompt) => {
  const genAI = getGenAI();
  if (!genAI) return null;

  const modelsToTry = [
    activeGeminiModelName,
    ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== activeGeminiModelName),
  ];

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text();
      if (text) {
        if (activeGeminiModelName !== modelName) {
          console.log(`[AI Service] Successfully switched active Gemini model to: ${modelName}`);
          activeGeminiModelName = modelName;
        }
        return { text, model: modelName, provider: 'gemini' };
      }
    } catch (err) {
      console.warn(`[AI Service] Gemini model ${modelName} returned error: ${err.message?.substring(0, 120)}`);
      lastError = err;
    }
  }

  console.error('[AI Service] All Gemini candidate models failed:', lastError?.message);
  return null;
};

// Calculates BMI, BMR (Mifflin-St Jeor) and estimated daily calorie needs
const calculateHealthMetrics = ({ age, gender, heightCm, weightKg, activityLevel }) => {
  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
  const proteinGrams = Math.round(weightKg * 1.6);

  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  return { bmi, bmiCategory, bmr: Math.round(bmr), tdee, proteinGrams };
};

// Builds a system prompt tailored to nutrition assistant behaviour
const buildNutritionSystemPrompt = () => `
You are NutriChef AI, a friendly and expert certified dietitian & nutrition assistant for NutriChef (a healthy homemade food delivery app in India).
You provide practical, safe, calorie-conscious, and food-first guidance with a strong focus on Indian meals (oats, salads, grilled chicken, paneer, brown rice, millets, dal, sprouts).
You are not a doctor - for medical conditions, gently suggest consulting a healthcare professional alongside your recommendations.
Keep responses structured, concise, warm, and highly actionable with approximate calories, protein macros, and healthy cooking tips.
`;

// Which provider is currently active, purely for surfacing to the client/logs
const getActiveProvider = () => {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return 'rule-based';
};

// Intelligently matches and ranks available dishes based on user query and health profile
const matchFoodsForQuery = (message = '', context = {}, availableFoods = []) => {
  if (!availableFoods || availableFoods.length === 0) return [];

  const lower = (message || '').toLowerCase();
  const goal = (context?.goal || '').toLowerCase();

  const wantsHighProtein = /protein|muscle|gym|bulk|lean|strength/i.test(lower) || goal === 'gain_muscle';
  const wantsLowCalorie = /weight|loss|fat|deficit|calorie|light|diet|slim/i.test(lower) || goal === 'lose_weight';
  const wantsDiabetic = /diabet|sugar|blood|glycemic|low\s*gi|insulin/i.test(lower) || goal === 'manage_diabetes';
  const wantsBreakfast = /breakfast|morning|idli|dosa|oats|omelette|pongal/i.test(lower);
  const wantsDinner = /dinner|night|evening/i.test(lower);
  const wantsSalad = /salad|bowl|sprouts/i.test(lower);
  const wantsPureVeg = /pure\s*veg|vegetarian|without\s*meat|no\s*chicken/i.test(lower);
  const wantsNonVeg = /non\s*veg|chicken|fish|meat|poultry/i.test(lower);

  const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);

  const scored = availableFoods.map((f) => {
    let score = 55;
    let reason = 'Balanced nutritional homemade meal';
    const nameLower = (f.name || '').toLowerCase();
    const tagsLower = (f.tags || []).map((t) => t.toLowerCase()).join(' ');
    const descLower = (f.description || '').toLowerCase();

    for (const w of words) {
      if (nameLower.includes(w)) score += 35;
      else if (tagsLower.includes(w)) score += 20;
      else if (descLower.includes(w)) score += 10;
    }

    if (wantsHighProtein) {
      const p = f.nutrition?.protein || 0;
      if (p >= 30) {
        score += 45;
        reason = `High Protein Powerhouse (${p}g protein) for muscle synthesis`;
      } else if (p >= 18) {
        score += 30;
        reason = `Rich in Lean Protein (${p}g protein) & clean calories`;
      }
    }

    if (wantsLowCalorie) {
      const cal = f.nutrition?.calories || 400;
      if (cal <= 250) {
        score += 40;
        reason = `Ultra Low Calorie (${cal} kcal) to sustain easy fat loss`;
      } else if (cal <= 350) {
        score += 25;
        reason = `Calorie Deficit Friendly (${cal} kcal) with ${f.nutrition?.protein || 10}g protein`;
      }
    }

    if (wantsDiabetic) {
      if (f.suitableFor?.includes('diabetic_friendly') || tagsLower.includes('diabetic') || tagsLower.includes('fiber') || nameLower.includes('oats') || nameLower.includes('quinoa')) {
        score += 45;
        reason = 'Low GI & high soluble fiber to prevent glucose spikes';
      }
    }

    if (wantsBreakfast) {
      if (tagsLower.includes('breakfast') || f.suitableFor?.includes('heart_healthy') || nameLower.includes('idli') || nameLower.includes('upma') || nameLower.includes('dosa') || nameLower.includes('omelette')) {
        score += 40;
        reason = 'Wholesome morning energizing breakfast with steady macros';
      }
    }

    if (wantsDinner) {
      if ((f.nutrition?.calories || 400) <= 380) {
        score += 30;
        reason = 'Light & easy-to-digest dinner meal for evening satiety';
      }
    }

    if (wantsSalad) {
      if (tagsLower.includes('salad') || tagsLower.includes('bowl') || nameLower.includes('salad') || nameLower.includes('bowl')) {
        score += 35;
        reason = 'Fresh antioxidant-rich nutrient bowl with clean herbs';
      }
    }

    if (wantsPureVeg) {
      if (f.isVeg) score += 25;
      else score -= 90;
    } else if (wantsNonVeg) {
      if (!f.isVeg) score += 30;
      else score -= 20;
    }

    score += Math.round((f.rating || 4.5) * 4);

    return {
      _id: f._id,
      name: f.name,
      images: f.images,
      price: f.price,
      discountPrice: f.discountPrice,
      isVeg: f.isVeg,
      rating: f.rating,
      totalReviews: f.totalReviews,
      nutrition: f.nutrition,
      tags: f.tags,
      recommendReason: reason,
      matchScore: Math.min(99, Math.max(65, score)),
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 4);
};

const chatWithAssistant = async (message, context = {}, availableFoods = []) => {
  const matchedFoods = matchFoodsForQuery(message, context, availableFoods);
  const dishNames = (availableFoods || []).slice(0, 15).map((f) => `${f.name} (${f.nutrition?.calories} kcal, ${f.nutrition?.protein}g protein)`).join(', ');

  const systemPrompt = `${buildNutritionSystemPrompt()}
Our verified local home kitchen menu includes: ${dishNames}.
Whenever relevant, recommend these actual freshly cooked NutriChef dishes by exact name so the customer can order them directly!`;

  const contextStr = Object.keys(context || {}).length ? JSON.stringify(context) : 'None';
  const userContent = `User Context / Health Profile: ${contextStr}\n\nUser Question: ${message}\n\nPlease respond directly to the user in a friendly, encouraging, and clear nutrition consultation format:`;

  // 1. Try Groq (Ultra-fast LPU inference)
  if (process.env.GROQ_API_KEY) {
    const groqRes = await executeGroqGeneration([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ]);
    if (groqRes?.text) {
      return { 
        reply: groqRes.text, 
        recommendedFoods: matchedFoods, 
        provider: 'groq', 
        model: groqRes.model 
      };
    }
  }

  // 2. Try Google Gemini (High accuracy multi-turn)
  if (process.env.GEMINI_API_KEY) {
    const geminiPrompt = `${systemPrompt}\n\n${userContent}`;
    const geminiRes = await executeGeminiGeneration(geminiPrompt);
    if (geminiRes?.text) {
      return { 
        reply: geminiRes.text, 
        recommendedFoods: matchedFoods, 
        provider: 'gemini', 
        model: geminiRes.model 
      };
    }
  }

  // 3. Smart contextual fallback
  const lower = (message || '').toLowerCase();
  let fallbackReply = '';
  if (lower.includes('weight') || lower.includes('fat') || lower.includes('deficit')) {
    fallbackReply = "For sustainable weight loss, prioritize high-fiber and lean-protein meals that keep you full while maintaining a moderate 300-500 kcal deficit. Dishes like our Sprouts and Corn Salad (190 kcal • 11g protein) or Chickpea Protein Bowl (380 kcal • 18g protein) are ideal choices to avoid glucose spikes!";
  } else if (lower.includes('protein') || lower.includes('muscle') || lower.includes('gym')) {
    fallbackReply = "To maximize muscle synthesis and satiety, aim for 1.6g to 2.0g of protein per kg of body weight daily. Top recommendations from our certified home kitchens include Chicken Tikka Bowl (38g protein • 430 kcal), Grilled Chicken Breast (42g protein • 380 kcal), and Paneer Quinoa Bowl (26g protein • 420 kcal).";
  } else if (lower.includes('diabet') || lower.includes('sugar')) {
    fallbackReply = "For optimal blood sugar management, combine complex carbohydrates with soluble fiber and healthy fats to slow down digestion. Our chef-crafted Vegetable Oats Upma, Multigrain Chapati, and Sprouts Protein Bowls are specifically prepared with zero refined sugars and cold-pressed oils.";
  } else if (lower.includes('breakfast') || lower.includes('morning')) {
    fallbackReply = "Start your morning with slow-burning complex carbs and clean protein! I recommend our Mini Idli with Sambar (240 kcal • 9g protein) or Vegetable Oats Upma for steady all-morning stamina without sluggishness.";
  } else {
    fallbackReply = "Welcome to NutriChef AI! I can help you calculate your daily calorie targets, customize high-protein lunch & dinner plans, or recommend dishes from local home kitchens tailored to your fitness goals. What would you like to eat today?";
  }

  return {
    reply: fallbackReply,
    recommendedFoods: matchedFoods,
    provider: 'rule-based',
    mock: true,
  };
};

const generateMealRecommendation = async (healthProfile, availableFoods) => {
  const foodSummary = (availableFoods || []).map((f) => ({
    id: f._id,
    name: f.name,
    nutrition: f.nutrition,
    suitableFor: f.suitableFor,
  }));

  const prompt = `Given this user health profile: ${JSON.stringify(
    healthProfile
  )}, and this list of available foods: ${JSON.stringify(
    foodSummary
  )}, return ONLY a JSON array (no markdown, no commentary) of the top 5 recommended food IDs with a one-line reason each. Format: [{"id": "...", "reason": "..."}]`;

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    const groqRes = await executeGroqGeneration([
      { role: 'system', content: buildNutritionSystemPrompt() },
      { role: 'user', content: prompt },
    ]);
    if (groqRes?.text) {
      try {
        const text = groqRes.text.replace(/```json|```/g, '').trim();
        return { recommendations: JSON.parse(text), provider: 'groq', model: groqRes.model };
      } catch (_) {
        return { recommendations: [], raw: groqRes.text, provider: 'groq', model: groqRes.model };
      }
    }
  }

  // 2. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    const geminiRes = await executeGeminiGeneration(`${buildNutritionSystemPrompt()}\n\n${prompt}`);
    if (geminiRes?.text) {
      try {
        const text = geminiRes.text.replace(/```json|```/g, '').trim();
        return { recommendations: JSON.parse(text), provider: 'gemini', model: geminiRes.model };
      } catch (_) {
        return { recommendations: [], raw: geminiRes.text, provider: 'gemini', model: geminiRes.model };
      }
    }
  }

  // 3. Rule-based fallback
  const filtered = (availableFoods || [])
    .filter((f) => !healthProfile?.goal || (f.suitableFor || []).includes(healthProfile.goal))
    .slice(0, 5);
  return { recommendations: filtered.length ? filtered : (availableFoods || []).slice(0, 5), mock: true, provider: 'rule-based' };
};

module.exports = { calculateHealthMetrics, chatWithAssistant, generateMealRecommendation, getActiveProvider };
