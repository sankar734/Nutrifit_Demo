const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Chef = require('../models/Chef');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Food = require('../models/Food');
const Category = require('../models/Category');
const DeliveryPartner = require('../models/DeliveryPartner');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const { createNotification } = require('./notificationController');

const generateOrderNumber = () => `NC${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Shared helper: sends the customer confirmation email/notification and the chef/admin "new order" notification.
const sendOrderConfirmation = async ({ io, order, customer, chef }) => {
  if (customer?.email) emailService.sendOrderConfirmationEmail(customer, order).catch(() => {});

  if (io) {
    await createNotification(io, {
      userId: order.customer,
      title: 'Order Confirmed!',
      body: `Your order ${order.orderNumber} for ₹${order.totalAmount} has been confirmed. Chef is preparing your healthy meal!`,
      type: 'order',
      data: { orderId: order._id },
    });

    if (chef?.user) {
      await createNotification(io, {
        userId: chef.user,
        title: 'New Order Received! 🍳',
        body: `You have a new confirmed order ${order.orderNumber} worth ₹${order.subtotal}.`,
        type: 'order',
        data: { orderId: order._id },
      });
    }

    io.to(`chef_${chef?._id}`).emit('new_order', order);
    io.to('admin_room').emit('new_order', order);
    io.emit('new_order_broadcast', order);
  }
};

// @desc Place an order from cart or direct items
const placeOrder = asyncHandler(async (req, res) => {
  const { 
    addressId, 
    deliveryAddress: directAddress, 
    paymentMethod = 'razorpay', 
    paymentStatus: directPaymentStatus,
    paymentId: directPaymentId,
    couponCode, 
    scheduledFor,
    items: directItems
  } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
  
  // Resolve address
  let address = null;
  if (addressId && req.user.addresses && typeof req.user.addresses.id === 'function') {
    address = req.user.addresses.id(addressId);
  }
  if (!address && directAddress && directAddress.addressLine) {
    address = directAddress;
    try {
      const exists = req.user.addresses?.some(
        (a) => a.addressLine === directAddress.addressLine && a.pincode === directAddress.pincode
      );
      if (!exists) {
        req.user.addresses.push({
          label: directAddress.label || 'Home',
          addressLine: directAddress.addressLine,
          city: directAddress.city || 'Chennai',
          state: directAddress.state || 'Tamil Nadu',
          pincode: directAddress.pincode || '600001',
          isDefault: req.user.addresses.length === 0,
        });
        await req.user.save();
      }
    } catch (_) {}
  } else if (!address && req.user.addresses && req.user.addresses.length > 0) {
    address = req.user.addresses.find((a) => a.isDefault) || req.user.addresses[0];
  } else if (!address) {
    address = {
      label: 'Home',
      addressLine: '14, 2nd Cross Street, Gandhi Nagar, Adyar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
    };
  }

  // Resolve Chef
  let chef = null;
  if (cart?.chef) {
    chef = await Chef.findById(cart.chef);
  }
  if (!chef) {
    chef = await Chef.findOne();
  }

  // Resolve items from Cart or direct payload
  let items = [];
  if (cart && cart.items?.length > 0) {
    const validItems = cart.items.filter((i) => i && i.food);
    items = validItems.map((i) => ({
      food: i.food._id,
      name: i.food.name,
      price: i.food.discountPrice || i.food.price || 150,
      quantity: i.quantity || 1,
    }));
  }

  // Fallback to direct items if cart was empty or items passed
  if (items.length === 0 && directItems?.length > 0) {
    let defaultCategory = await Category.findOne();
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'Healthy Meals',
        slug: 'healthy-meals',
      });
    }

    if (!chef) {
      chef = await Chef.findOne();
      if (!chef) {
        const chefUser = await User.findOne({ role: 'chef' }) || await User.findOne();
        chef = await Chef.create({
          user: chefUser._id,
          kitchenName: "NutriFit Cloud Kitchen",
          isApproved: true,
          address: 'Adyar, Chennai',
        });
      }
    }

    for (const d of directItems) {
      let fId = d.food?._id || d.food || d._id;
      let fName = d.food?.name || d.name || 'Healthy Dish';
      let fPrice = Number(d.food?.discountPrice || d.food?.price || d.price) || 169;

      let foodDoc = null;
      if (mongoose.Types.ObjectId.isValid(fId)) {
        foodDoc = await Food.findById(fId);
      }
      if (!foodDoc) {
        const firstWord = fName.split(' ')[0] || fName;
        foodDoc = await Food.findOne({
          $or: [
            { name: new RegExp(fName.trim(), 'i') },
            { name: new RegExp(firstWord.trim(), 'i') },
          ],
        });
      }
      if (!foodDoc) {
        foodDoc = await Food.create({
          chef: chef._id,
          category: defaultCategory._id,
          name: fName,
          price: fPrice,
          images: d.images || d.food?.images || ['/food-images/berry-overnight-oats.jpg'],
          isVeg: d.isVeg !== undefined ? d.isVeg : true,
          nutrition: d.nutrition || d.food?.nutrition || { calories: 350, protein: 18, carbs: 40, fat: 10 },
        });
      }

      items.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: foodDoc.discountPrice || foodDoc.price || fPrice,
        quantity: Number(d.quantity) || 1,
      });
    }
  }

  if (items.length === 0) {
    return error(res, 'No items in cart to place order', 400);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && subtotal >= coupon.minOrderValue) {
      discount =
        coupon.discountType === 'percentage'
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;
    }
  }

  const totalAmount = Math.max(subtotal + deliveryFee + tax - discount, 0);

  if (paymentMethod === 'wallet' && (req.user.walletBalance || 0) < totalAmount) {
    return error(res, `Insufficient wallet balance (₹${req.user.walletBalance || 0}). Please select online payment or Cash on Delivery.`, 400);
  }

  const commissionRate = chef?.commissionRate || 15;
  const chefCommission = Math.round((subtotal * commissionRate) / 100);
  const chefEarning = subtotal - chefCommission;

  // Determine payment status
  let paymentStatus = 'pending';
  let paymentId = undefined;
  if (paymentMethod === 'wallet') {
    paymentStatus = 'paid';
  } else if (paymentMethod === 'razorpay' && directPaymentStatus === 'paid') {
    paymentStatus = 'paid';
    paymentId = directPaymentId || `online_pay_${Date.now()}`;
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: req.user._id,
    chef: chef?._id,
    items,
    deliveryAddress: {
      addressLine: address.addressLine,
      city: address.city || 'Chennai',
      state: address.state || 'Tamil Nadu',
      pincode: address.pincode || '600001',
      location: address.location,
    },
    subtotal,
    deliveryFee,
    discount,
    tax,
    totalAmount,
    coupon: coupon ? coupon._id : undefined,
    paymentMethod,
    paymentStatus,
    paymentId,
    status: 'placed',
    statusHistory: [{ status: 'placed' }],
    chefCommission,
    chefEarning,
    scheduledFor,
  });

  if (paymentMethod === 'wallet') {
    req.user.walletBalance = Math.max(0, (req.user.walletBalance || 0) - totalAmount);
    await req.user.save();
    try {
      const Wallet = require('../models/Wallet');
      await Wallet.create({
        user: req.user._id,
        type: 'debit',
        amount: totalAmount,
        reason: `Payment for NutriChef Order ${order.orderNumber}`,
        balanceAfter: req.user.walletBalance,
      });
    } catch (_) {}
  }

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Clear cart
  if (cart) {
    cart.items = [];
    cart.chef = null;
    cart.coupon = null;
    await cart.save();
  }

  if (chef) {
    chef.totalOrders = (chef.totalOrders || 0) + 1;
    await chef.save();
  }

  const io = req.app.get('io');

  // Immediately confirm COD, Wallet, or verified paid Online order
  if (paymentMethod === 'cod' || paymentMethod === 'wallet' || paymentStatus === 'paid') {
    await sendOrderConfirmation({ io, order, customer: req.user, chef });
  }

  return success(res, 'Order placed successfully', { order }, 201);
});

// @desc Get logged in customer's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).populate('chef', 'kitchenName');
  return success(res, 'Orders fetched', { orders });
});

// @desc Get single order (with live tracking info)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('chef', 'kitchenName location user address')
    .populate('deliveryPartner', 'currentLocation user vehicleType vehicleNumber rating')
    .populate('customer', 'name phone');
  if (!order) return error(res, 'Order not found', 404);

  return success(res, 'Order fetched', { order });
});

// @desc Chef: get orders for chef
const getChefOrders = asyncHandler(async (req, res) => {
  const chef = await Chef.findOne({ user: req.user._id });
  if (!chef) return error(res, 'Chef profile not found', 404);

  const { status } = req.query;
  const query = { chef: chef._id };
  if (status) query.status = status;

  const orders = await Order.find(query).sort({ createdAt: -1 }).populate('customer', 'name phone');
  return success(res, 'Chef orders fetched', { orders });
});

// @desc Update order status (chef / delivery / admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const order = await Order.findById(req.params.id)
    .populate('chef')
    .populate('customer');
  if (!order) return error(res, 'Order not found', 404);

  order.status = status;
  order.statusHistory.push({ status });
  if (status === 'cancelled' || status === 'rejected') {
    order.cancellationReason = cancellationReason;
  }

  // When order is delivered: mark paymentStatus = paid and credit delivery partner
  if (status === 'delivered') {
    order.paymentStatus = 'paid';
    if (!order.paymentId) {
      order.paymentId = `cod_collected_${Date.now()}`;
    }

    if (order.deliveryPartner) {
      await DeliveryPartner.findByIdAndUpdate(order.deliveryPartner, {
        $inc: { walletBalance: 40, totalDeliveries: 1 },
      }).catch(() => {});
    }
  }

  await order.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`order_${order._id}`).emit('order_status_update', { 
      orderId: order._id, 
      status, 
      paymentStatus: order.paymentStatus 
    });

    if (status === 'ready') {
      io.to('delivery_pool').emit('order_available_for_pickup', {
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
      io.emit('order_available_for_pickup', {
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
    }

    io.to('admin_room').emit('order_status_update', { 
      orderId: order._id, 
      status, 
      paymentStatus: order.paymentStatus 
    });
    io.emit('stats_update');
  }

  // Notifications
  if (status === 'delivered') {
    // 1. Customer notification: Order delivered & Payment received
    await createNotification(io, {
      userId: order.customer._id || order.customer,
      title: 'Order Received & Payment Done! 🎉',
      body: `Your healthy meal order ${order.orderNumber} has been delivered successfully. Payment of ₹${order.totalAmount} has been received. Enjoy your fresh meal!`,
      type: 'order',
      data: { orderId: order._id },
    });

    // 2. Chef notification: Order delivered
    if (order.chef?.user) {
      await createNotification(io, {
        userId: order.chef.user,
        title: 'Order Delivered! 🏁',
        body: `Order ${order.orderNumber} was delivered to the customer. Payout of ₹${order.chefEarning} has been recorded.`,
        type: 'order',
        data: { orderId: order._id },
      });
    }
  } else {
    // General status update notification
    await createNotification(io, {
      userId: order.customer._id || order.customer,
      title: `Order Status: ${status.replace('_', ' ').toUpperCase()}`,
      body: `Your order ${order.orderNumber} is now ${status.replace('_', ' ')}.`,
      type: 'order',
      data: { orderId: order._id },
    });
  }

  return success(res, 'Order status updated', { order });
});

// @desc Customer / Admin: Cancel order with tiered refund policy
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason = 'Cancelled by customer' } = req.body;
  const order = await Order.findById(req.params.id)
    .populate('chef')
    .populate('customer');

  if (!order) return error(res, 'Order not found', 404);

  // Check authorization
  const customerId = order.customer?._id ? order.customer._id.toString() : order.customer?.toString();
  const userId = req.user._id.toString();
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

  if (customerId !== userId && !isAdmin) {
    return error(res, 'Not authorized to cancel this order', 403);
  }

  // Check terminal or delivery states
  if (['cancelled', 'rejected'].includes(order.status)) {
    return error(res, 'This order is already cancelled', 400);
  }

  if (['picked_up', 'on_the_way', 'delivered'].includes(order.status)) {
    return error(res, 'Cannot cancel order once it is out for delivery or delivered', 400);
  }

  const previousStatus = order.status;
  let refundPercentage = 100;
  let refundAmount = order.totalAmount;
  let cancellationFee = 0;
  let policyMessage = '';

  // Tier 1: Before cooking starts -> 100% refund
  if (['placed', 'accepted'].includes(previousStatus)) {
    refundPercentage = 100;
    refundAmount = order.totalAmount;
    cancellationFee = 0;
    policyMessage = `Order was cancelled before kitchen preparation started. 100% full refund of ₹${refundAmount} has been credited to your wallet.`;
  }
  // Tier 2: During cooking / ready -> 50% refund (half amount returned)
  else if (['preparing', 'ready'].includes(previousStatus)) {
    refundPercentage = 50;
    refundAmount = Math.round(order.totalAmount * 0.5);
    cancellationFee = order.totalAmount - refundAmount;
    policyMessage = `Order was cancelled while kitchen was preparing your meal. As per policy, 50% refund of ₹${refundAmount} has been credited to your wallet (₹${cancellationFee} deducted for ingredient costs).`;
  }

  order.status = 'cancelled';
  order.cancellationReason = `${reason} (${refundPercentage}% refund)`;
  order.refundAmount = refundAmount;
  order.refundPercentage = refundPercentage;
  order.cancellationFee = cancellationFee;
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'cancelled', timestamp: new Date() });
  if (refundAmount > 0) {
    order.paymentStatus = 'refunded';
  }

  await order.save();

  // Process refund to customer wallet
  let updatedBalance = req.user.walletBalance || 0;
  if (refundAmount > 0) {
    const customerUser = await User.findById(customerId);
    if (customerUser) {
      customerUser.walletBalance = (customerUser.walletBalance || 0) + refundAmount;
      await customerUser.save();
      updatedBalance = customerUser.walletBalance;

      const WalletTransaction = require('../models/Wallet');
      await WalletTransaction.create({
        user: customerUser._id,
        type: 'credit',
        amount: refundAmount,
        reason: `${refundPercentage}% refund for cancelled order #${order.orderNumber}`,
        order: order._id,
        balanceAfter: customerUser.walletBalance,
      }).catch(() => {});
    }
  }

  const io = req.app.get('io');

  // Customer notification
  await createNotification(io, {
    userId: customerId,
    title: refundPercentage === 100
      ? `Order #${order.orderNumber} Cancelled · Full Refund ₹${refundAmount}`
      : `Order #${order.orderNumber} Cancelled · 50% Refund ₹${refundAmount}`,
    body: policyMessage,
    type: 'order',
    data: { orderId: order._id, status: 'cancelled', refundAmount, refundPercentage },
  });

  // Chef notification
  if (order.chef?.user) {
    await createNotification(io, {
      userId: order.chef.user,
      title: `Order #${order.orderNumber} Cancelled ⚠️`,
      body: `Customer cancelled order #${order.orderNumber}. Previous status was ${previousStatus}. Preparation compensation: ₹${cancellationFee}.`,
      type: 'order',
      data: { orderId: order._id, status: 'cancelled' },
    });
  }

  // Realtime Socket updates
  if (io) {
    io.to(`order_${order._id}`).emit('order_status_update', {
      orderId: order._id,
      status: 'cancelled',
      refundAmount,
      refundPercentage,
      cancellationFee,
      policyMessage,
    });

    if (order.chef?._id) {
      io.to(`chef_${order.chef._id}`).emit('order_cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount,
        cancellationFee,
        policyMessage,
      });
      io.to(`chef_${order.chef._id}`).emit('order_status_update', {
        orderId: order._id,
        status: 'cancelled',
      });
    }

    io.to('admin_room').emit('order_status_update', {
      orderId: order._id,
      status: 'cancelled',
      refundAmount,
      refundPercentage,
    });

    io.emit('stats_update');
  }

  return success(res, policyMessage, {
    order,
    refundAmount,
    refundPercentage,
    cancellationFee,
    walletBalance: updatedBalance,
    policyMessage,
  });
});

module.exports = { 
  placeOrder, 
  getMyOrders, 
  getOrderById, 
  getChefOrders, 
  updateOrderStatus, 
  sendOrderConfirmation,
  cancelOrder 
};
