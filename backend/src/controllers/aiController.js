const Food = require('../models/Food');
const AIHistory = require('../models/AIHistory');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const aiService = require('../services/aiService');

// @desc Calculate BMI / BMR / TDEE / protein needs
const getHealthMetrics = asyncHandler(async (req, res) => {
  const { age, gender, heightCm, weightKg, activityLevel } = req.body;
  if (!age || !gender || !heightCm || !weightKg) {
    return error(res, 'age, gender, heightCm and weightKg are required');
  }
  const metrics = aiService.calculateHealthMetrics({ age, gender, heightCm, weightKg, activityLevel });
  return success(res, 'Health metrics calculated', metrics);
});

// @desc AI meal recommendation based on health profile
const getMealRecommendation = asyncHandler(async (req, res) => {
  const healthProfile = req.body.healthProfile || req.user?.healthProfile || {};
  const foods = await Food.find({ isAvailable: true }).limit(50);

  const result = await aiService.generateMealRecommendation(healthProfile, foods);

  if (req.user?._id) {
    await AIHistory.create({
      user: req.user._id,
      type: 'meal_recommendation',
      prompt: JSON.stringify(healthProfile),
      response: result,
    }).catch(() => {});
  }

  return success(res, 'Meal recommendations generated', result);
});

// @desc AI chat assistant
const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return error(res, 'Message is required');

  const availableFoods = await Food.find({ isAvailable: true }).limit(50).lean();
  const result = await aiService.chatWithAssistant(message, req.user?.healthProfile || {}, availableFoods);

  if (req.user?._id) {
    await AIHistory.create({
      user: req.user._id,
      type: 'chat',
      prompt: message,
      response: result,
    }).catch(() => {});
  }

  return success(res, 'AI response generated', result);
});

// @desc Get AI history for the user
const getHistory = asyncHandler(async (req, res) => {
  const history = await AIHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return success(res, 'AI history fetched', { history });
});

module.exports = { getHealthMetrics, getMealRecommendation, chat, getHistory };
