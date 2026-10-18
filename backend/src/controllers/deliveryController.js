const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const { createNotification } = require('./notificationController');

// @desc Register as a delivery partner (creates profile for logged in user)
const registerDeliveryPartner = asyncHandler(async (req, res) => {
  const existing = await DeliveryPartner.findOne({ user: req.user._id });
  if (existing) return error(res, 'Delivery partner profile already exists');

  const partner = await DeliveryPartner.create({ ...req.body, user: req.user._id });
  req.user.role = 'delivery';
  await req.user.save();

  const io = req.app.get('io');
  await createNotification(io, {
    userId: req.user._id,
    title: 'Delivery partner application received',
    body: "Your application is pending document verification. We'll notify you once approved.",
    type: 'system',
  });
  if (req.user.email) {
    emailService
      .sendEmail({
        to: req.user.email,
        subject: 'NutriChef — Delivery partner application received',
        html: `<p>Hi ${req.user.name},</p><p>Thanks for applying to become a NutriChef delivery partner! Your application is pending document verification. We'll email you as soon as it's approved.</p>`,
      })
      .catch(() => {});
  }

  return success(res, 'Delivery partner profile created, pending verification', { partner }, 201);
});

// @desc Toggle online/offline availability
const toggleOnline = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) return error(res, 'Delivery partner profile not found', 404);
  partner.isOnline = !partner.isOnline;
  await partner.save();
  await partner.populate('user', 'name email phone avatar');
  return success(res, `You are now ${partner.isOnline ? 'online' : 'offline'}`, { partner });
});

// @desc Update live GPS location
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const partner = await DeliveryPartner.findOneAndUpdate(
    { user: req.user._id },
    { currentLocation: { type: 'Point', coordinates: [lng, lat] } },
    { new: true }
  );
  if (!partner) return error(res, 'Delivery partner profile not found', 404);
  return success(res, 'Location updated', { partner });
});

// @desc Get orders that are ready for pickup and unassigned
const getAvailableOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'ready', deliveryPartner: null })
    .populate('chef', 'kitchenName address location')
    .populate('customer', 'name')
    .sort({ createdAt: 1 });
  return success(res, 'Available orders fetched', { orders });
});

// @desc Accept a delivery
const acceptDelivery = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) return error(res, 'Delivery partner profile not found', 404);

  const order = await Order.findById(req.params.orderId);
  if (!order) return error(res, 'Order not found', 404);
  if (order.deliveryPartner) return error(res, 'Order already assigned to another delivery partner');

  order.deliveryPartner = partner._id;
  order.status = 'picked_up';
  order.statusHistory.push({ status: 'picked_up' });
  await order.save();

  const io = req.app.get('io');
  if (io) io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status: 'picked_up' });

  return success(res, 'Delivery accepted', { order });
});

// @desc Get my active/past deliveries
const getMyDeliveries = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) return error(res, 'Delivery partner profile not found', 404);

  const { status } = req.query;
  const query = { deliveryPartner: partner._id };
  if (status) {
    if (status.includes(',')) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  }

  const orders = await Order.find(query)
    .populate('chef', 'kitchenName address')
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 });
  return success(res, 'Deliveries fetched', { orders });
});

// @desc Delivery partner dashboard stats
const getDeliveryDashboard = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
  if (!partner) return error(res, 'Delivery partner profile not found', 404);

  const activeOrders = await Order.countDocuments({
    deliveryPartner: partner._id,
    status: { $in: ['picked_up', 'on_the_way'] },
  });
  const deliveredOrders = await Order.countDocuments({ deliveryPartner: partner._id, status: 'delivered' });
  const recentDeliveries = await Order.find({ deliveryPartner: partner._id, status: 'delivered' })
    .populate('chef', 'kitchenName address')
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .limit(20);

  return success(res, 'Delivery dashboard fetched', {
    partner,
    recentDeliveries,
    stats: { activeOrders, deliveredOrders, totalDeliveries: partner.totalDeliveries, walletBalance: partner.walletBalance },
  });
});

module.exports = {
  registerDeliveryPartner,
  toggleOnline,
  updateLocation,
  getAvailableOrders,
  acceptDelivery,
  getMyDeliveries,
  getDeliveryDashboard,
};
