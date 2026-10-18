const User = require('../models/User');
const Chef = require('../models/Chef');
const DeliveryPartner = require('../models/DeliveryPartner');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

// @desc Admin dashboard summary stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalChefs, totalDeliveryPartners, totalOrders, totalFoods] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Chef.countDocuments(),
    DeliveryPartner.countDocuments(),
    Order.countDocuments(),
    Food.countDocuments(),
  ]);

  const allOrders = await Order.find();
  const totalRevenue = allOrders.reduce((sum, o) => {
    if (o.status !== 'cancelled' && o.status !== 'rejected') {
      return sum + (o.totalAmount || 0);
    }
    return sum;
  }, 0);

  const totalCommission = allOrders.reduce((sum, o) => {
    if (o.status !== 'cancelled' && o.status !== 'rejected') {
      return sum + (o.chefCommission || 0);
    }
    return sum;
  }, 0);

  const pendingChefVerifications = await Chef.countDocuments({ kycStatus: 'pending' });

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customer', 'name phone email')
    .populate('chef', 'kitchenName');

  return success(res, 'Dashboard stats fetched', {
    totalUsers,
    totalChefs,
    totalDeliveryPartners,
    totalOrders,
    totalFoods,
    totalRevenue,
    totalCommission,
    pendingChefVerifications,
    recentOrders,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (role && role !== 'All') query.role = role.toLowerCase();
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];

  const users = await User.find(query).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);
  return success(res, 'Users fetched', { users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return error(res, 'User not found', 404);
  user.isActive = !user.isActive;
  await user.save();
  return success(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, { user: user.toSafeObject() });
});

const listChefs = asyncHandler(async (req, res) => {
  const { kycStatus, page = 1, limit = 50 } = req.query;
  const query = {};
  if (kycStatus && kycStatus !== 'All') query.kycStatus = kycStatus.toLowerCase();

  const chefs = await Chef.find(query)
    .populate('user', 'name email phone')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  const total = await Chef.countDocuments(query);
  return success(res, 'Chefs fetched', { chefs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

const updateChefKyc = asyncHandler(async (req, res) => {
  const { kycStatus } = req.body;
  const chef = await Chef.findById(req.params.id);
  if (!chef) return error(res, 'Chef not found', 404);
  chef.kycStatus = kycStatus;
  chef.isVerified = kycStatus === 'verified';
  await chef.save();
  return success(res, 'Chef KYC updated', { chef });
});

const listOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const query = {};
  if (status && status !== 'All') query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'name phone email')
    .populate('chef', 'kitchenName')
    .populate('deliveryPartner')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  const total = await Order.countDocuments(query);
  return success(res, 'Orders fetched', { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return success(res, 'Coupon created', { coupon }, 201);
});

const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return success(res, 'Coupons fetched', { coupons });
});

const updateCommissionRate = asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;
  const chef = await Chef.findById(req.params.id);
  if (!chef) return error(res, 'Chef not found', 404);
  chef.commissionRate = commissionRate;
  await chef.save();
  return success(res, 'Commission rate updated', { chef });
});

module.exports = {
  getDashboardStats,
  listUsers,
  toggleUserActive,
  listChefs,
  updateChefKyc,
  listOrders,
  createCoupon,
  listCoupons,
  updateCommissionRate,
};
