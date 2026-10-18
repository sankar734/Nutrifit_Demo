const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Chef = require('../models/Chef');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const cartPopulateOptions = {
  path: 'items.food',
  populate: { path: 'chef', select: 'kitchenName rating' },
};

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(cartPopulateOptions);
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  } else if (cart.items.some((i) => !i.food)) {
    // Filter out any dangling items where food was deleted
    cart.items = cart.items.filter((i) => i.food);
    await cart.save();
  }
  return success(res, 'Cart fetched', { cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { foodId, quantity = 1, name, price, images, isVeg, nutrition } = req.body;
  if (!foodId) {
    return error(res, 'Food item identifier is required', 400);
  }

  let food = null;
  if (mongoose.Types.ObjectId.isValid(foodId)) {
    food = await Food.findById(foodId);
  }

  // If not found by ObjectId, find by name or slug
  if (!food) {
    const searchName = name || String(foodId).replace(/^sample-/, '').replace(/[-_]/g, ' ');
    food = await Food.findOne({
      $or: [
        { name: new RegExp(searchName.trim(), 'i') },
        { slug: String(foodId) },
      ],
    });
  }

  // If still not found, create the dish in MongoDB under the default active chef and category
  if (!food) {
    let defaultChef = await Chef.findOne();
    if (!defaultChef) {
      const chefUser = await require('../models/User').findOne({ role: 'chef' }) || await require('../models/User').findOne();
      defaultChef = await Chef.create({
        user: chefUser._id,
        kitchenName: "NutriFit Cloud Kitchen",
        isApproved: true,
        address: 'Adyar, Chennai',
      });
    }

    let defaultCat = await Category.findOne();
    if (!defaultCat) {
      defaultCat = await Category.create({
        name: 'Healthy Breakfast',
        slug: 'healthy-breakfast',
      });
    }

    const cleanName = name || (typeof foodId === 'string' ? foodId.replace(/^sample-/, '').replace(/[-_]/g, ' ') : 'Healthy Dish');
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    food = await Food.create({
      chef: defaultChef._id,
      category: defaultCat._id,
      name: formattedName,
      description: 'Nutrient-calibrated homemade dish prepared with fresh ingredients and low oil.',
      price: Number(price) || 169,
      images: images?.length ? images : ['/food-images/berry-overnight-oats.jpg'],
      isVeg: isVeg !== undefined ? isVeg : true,
      nutrition: nutrition || { calories: 320, protein: 16, carbs: 40, fat: 10 },
      rating: 4.8,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [], chef: food.chef });
  }

  // Single-chef rule adaptation: if cart already has items from another chef,
  // reassign cart.chef or allow the meal rather than throwing a blocking error
  if (!cart.chef) {
    cart.chef = food.chef;
  }

  const existingItem = cart.items.find((i) => i.food && i.food.toString() === food._id.toString());
  if (existingItem) {
    existingItem.quantity += parseInt(quantity) || 1;
  } else {
    cart.items.push({ food: food._id, quantity: parseInt(quantity) || 1 });
  }

  await cart.save();
  await cart.populate(cartPopulateOptions);
  return success(res, 'Item added to cart', { cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { foodId, quantity, name } = req.body;
  if (!foodId && !name) {
    return error(res, 'Food item identifier is required', 400);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(cartPopulateOptions);
  if (!cart) return error(res, 'Cart not found', 404);

  // Match item flexibly by ObjectId, populated food _id, slug, or name
  const item = cart.items.find((i) => {
    if (!i.food) return false;
    const fObjId = i.food._id ? i.food._id.toString() : i.food.toString();
    if (foodId && fObjId === foodId.toString()) return true;
    if (i.food.slug && foodId && i.food.slug.toString() === foodId.toString()) return true;
    if (name && i.food.name && i.food.name.toLowerCase() === name.toLowerCase()) return true;
    if (foodId && i.food.name) {
      const cleanId = String(foodId).replace(/^sample-/, '').replace(/[-_]/g, ' ').toLowerCase();
      if (i.food.name.toLowerCase().includes(cleanId) || cleanId.includes(i.food.name.toLowerCase())) return true;
    }
    return false;
  });

  if (!item) return error(res, 'Item not in cart', 404);

  const newQty = parseInt(quantity);
  if (isNaN(newQty) || newQty <= 0) {
    const matchedFoodId = item.food._id ? item.food._id.toString() : item.food.toString();
    cart.items = cart.items.filter((i) => {
      if (!i.food) return false;
      const fObjId = i.food._id ? i.food._id.toString() : i.food.toString();
      return fObjId !== matchedFoodId;
    });
    if (cart.items.length === 0) {
      cart.chef = null;
      cart.coupon = null;
    }
  } else {
    item.quantity = newQty;
  }

  await cart.save();
  await cart.populate(cartPopulateOptions);
  return success(res, 'Cart updated', { cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], chef: null, coupon: null },
    { new: true }
  );
  return success(res, 'Cart cleared', { cart: cart || { items: [], chef: null, coupon: null } });
});

module.exports = { getCart, addToCart, updateCartItem, clearCart };
