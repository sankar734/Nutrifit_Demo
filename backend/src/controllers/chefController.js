const Chef = require('../models/Chef');
const Food = require('../models/Food');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const { createNotification } = require('./notificationController');

// @desc Register as chef (creates chef profile for logged in user)
const registerChef = asyncHandler(async (req, res) => {
  const existing = await Chef.findOne({ user: req.user._id });
  if (existing) return error(res, 'Chef profile already exists');

  const chef = await Chef.create({ ...req.body, user: req.user._id });
  req.user.role = 'chef';
  await req.user.save();

  const io = req.app.get('io');
  await createNotification(io, {
    userId: req.user._id,
    title: 'Chef application received',
    body: `Your kitchen "${chef.kitchenName}" is now pending KYC verification. We'll notify you once approved.`,
    type: 'system',
  });
  if (req.user.email) {
    emailService
      .sendEmail({
        to: req.user.email,
        subject: 'NutriChef — Chef application received',
        html: `<p>Hi ${req.user.name},</p><p>Thanks for applying to sell on NutriChef! Your kitchen <b>${chef.kitchenName}</b> is pending KYC verification. We'll email you as soon as it's approved.</p>`,
      })
      .catch(() => {});
  }

  return success(res, 'Chef profile created, pending verification', { chef }, 201);
});

// @desc Get nearby chefs
const getNearbyChefs = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistanceKm = 10 } = req.query;

  let query = { isVerified: true, isAvailable: true, holidayMode: false };
  let chefs;

  if (lat && lng) {
    chefs = await Chef.find({
      ...query,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(maxDistanceKm) * 1000,
        },
      },
    }).populate('user', 'name avatar');
  } else {
    chefs = await Chef.find(query).sort({ rating: -1 }).limit(20).populate('user', 'name avatar');
  }

  return success(res, 'Nearby chefs fetched', { chefs });
});

// @desc Get chef details + menu
const getChefDetails = asyncHandler(async (req, res) => {
  const chef = await Chef.findById(req.params.id).populate('user', 'name avatar');
  if (!chef) return error(res, 'Chef not found', 404);

  const foods = await Food.find({ chef: chef._id, isAvailable: true }).populate('category', 'name');
  return success(res, 'Chef details fetched', { chef, foods });
});

// @desc Update chef profile / availability
const updateChefProfile = asyncHandler(async (req, res) => {
  const chef = await Chef.findOne({ user: req.user._id });
  if (!chef) return error(res, 'Chef profile not found', 404);

  Object.assign(chef, req.body);
  await chef.save();
  return success(res, 'Chef profile updated', { chef });
});

// @desc Get my chef dashboard stats
const getChefDashboard = asyncHandler(async (req, res) => {
  const Order = require('../models/Order');
  const chef = await Chef.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
  if (!chef) return error(res, 'Chef profile not found', 404);

  const totalOrders = await Order.countDocuments({ chef: chef._id });
  const pendingOrders = await Order.countDocuments({ chef: chef._id, status: { $in: ['placed', 'accepted', 'preparing'] } });
  const deliveredOrders = await Order.find({ chef: chef._id, status: 'delivered' }).sort({ createdAt: -1 });
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.chefEarning || 0), 0);
  const foods = await Food.find({ chef: chef._id }).populate('category', 'name').sort({ createdAt: -1 });

  return success(res, 'Chef dashboard fetched', {
    chef,
    foods,
    deliveredOrders,
    stats: { totalOrders, pendingOrders, totalEarnings, deliveredCount: deliveredOrders.length },
  });
});

module.exports = {
  registerChef,
  getNearbyChefs,
  getChefDetails,
  updateChefProfile,
  getChefDashboard,
};
