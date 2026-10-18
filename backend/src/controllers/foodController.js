const Food = require('../models/Food');
const Chef = require('../models/Chef');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const createFood = asyncHandler(async (req, res) => {
  const chef = await Chef.findOne({ user: req.user._id });
  if (!chef) return error(res, 'Only chefs can create food items', 403);

  const food = await Food.create({ ...req.body, chef: chef._id });
  return success(res, 'Food item created', { food }, 201);
});

const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return error(res, 'Food not found', 404);
  Object.assign(food, req.body);
  await food.save();
  return success(res, 'Food updated', { food });
});

const deleteFood = asyncHandler(async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  return success(res, 'Food deleted');
});

// @desc Search / filter / sort foods
const getFoods = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    isVeg,
    minPrice,
    maxPrice,
    suitableFor,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = req.query;

  const query = { isAvailable: true };
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { tags: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  if (isVeg !== undefined) query.isVeg = isVeg === 'true';
  if (suitableFor) query.suitableFor = suitableFor;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
    rating: { rating: -1 },
    popular: { totalOrders: -1 },
  };

  const foods = await Food.find(query)
    .sort(sortMap[sortBy] || sortMap.newest)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('chef', 'kitchenName rating')
    .populate('category', 'name');

  const total = await Food.countDocuments(query);

  return success(res, 'Foods fetched', { foods, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

const getFoodDetails = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id).populate('chef').populate('category', 'name');
  if (!food) return error(res, 'Food not found', 404);
  return success(res, 'Food details fetched', { food });
});

module.exports = { createFood, updateFood, deleteFood, getFoods, getFoodDetails };
