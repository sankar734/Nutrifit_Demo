const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middlewares/auth');
const { getHealthMetrics, getMealRecommendation, chat, getHistory } = require('../controllers/aiController');

router.post('/health-metrics', optionalProtect, getHealthMetrics);
router.post('/meal-recommendation', optionalProtect, getMealRecommendation);
router.post('/chat', optionalProtect, chat);
router.get('/history', protect, getHistory);

module.exports = router;
