const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'chat',
        'meal_recommendation',
        'weekly_planner',
        'calorie_prediction',
        'diet_generator',
        'allergy_detection',
        'food_image_detection',
      ],
      required: true,
    },
    prompt: String,
    response: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIHistory', aiHistorySchema);
