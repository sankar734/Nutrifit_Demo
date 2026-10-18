const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    name: { type: String, required: true },
    description: String,
    images: [String],
    price: { type: Number, required: true },
    discountPrice: Number,
    isVeg: { type: Boolean, default: true },
    tags: [String],
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
    },
    allergens: [String],
    suitableFor: [
      {
        type: String,
        enum: [
          'weight_loss',
          'weight_gain',
          'diabetic_friendly',
          'heart_healthy',
          'kids',
          'senior_citizen',
          'fitness',
        ],
      },
    ],
    portionSize: String,
    preparationTimeMinutes: { type: Number, default: 30 },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    stockPerDay: { type: Number, default: 20 },
    stockRemainingToday: { type: Number, default: 20 },
  },
  { timestamps: true }
);

foodSchema.pre('save', async function () {
  if (!this.category) {
    try {
      const Category = mongoose.model('Category');
      const defaultCat = await Category.findOne();
      if (defaultCat) this.category = defaultCat._id;
    } catch (_) {}
  }
  if (!this.chef) {
    try {
      const Chef = mongoose.model('Chef');
      const defaultChef = await Chef.findOne();
      if (defaultChef) this.chef = defaultChef._id;
    } catch (_) {}
  }
});

module.exports = mongoose.model('Food', foodSchema);
