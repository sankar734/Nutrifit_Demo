const Review = require('../models/Review');
const Chef = require('../models/Chef');
const Food = require('../models/Food');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const createReview = asyncHandler(async (req, res) => {
  const { orderId, chefId, foodId, rating, comment, images } = req.body;

  const order = await Order.findById(orderId);
  if (!order || order.customer.toString() !== req.user._id.toString()) {
    return error(res, 'Invalid order for review');
  }
  if (order.status !== 'delivered') return error(res, 'You can only review delivered orders');

  const review = await Review.create({
    user: req.user._id,
    order: orderId,
    chef: chefId,
    food: foodId,
    rating,
    comment,
    images,
  });

  if (chefId) {
    const chef = await Chef.findById(chefId);
    const newTotal = chef.totalReviews + 1;
    chef.rating = (chef.rating * chef.totalReviews + rating) / newTotal;
    chef.totalReviews = newTotal;
    await chef.save();
  }
  if (foodId) {
    const food = await Food.findById(foodId);
    const newTotal = food.totalReviews + 1;
    food.rating = (food.rating * food.totalReviews + rating) / newTotal;
    food.totalReviews = newTotal;
    await food.save();
  }

  return success(res, 'Review submitted', { review }, 201);
});

const getChefReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ chef: req.params.chefId }).populate('user', 'name avatar').sort({ createdAt: -1 });
  return success(res, 'Reviews fetched', { reviews });
});

module.exports = { createReview, getChefReviews };
