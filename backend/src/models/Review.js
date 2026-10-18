const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef' },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
