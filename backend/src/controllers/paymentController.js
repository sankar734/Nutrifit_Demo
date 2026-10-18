const crypto = require('crypto');
const Order = require('../models/Order');
const Chef = require('../models/Chef');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { sendOrderConfirmation } = require('./orderController');

let razorpayInstance = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// @desc Create a Razorpay order for an existing NutriChef order (or a mock session if keys aren't configured)
// @route POST /api/payments/create-order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return error(res, 'Order not found', 404);
  if (order.customer.toString() !== req.user._id.toString()) return error(res, 'Not authorized', 403);

  const razorpay = getRazorpay();

  if (!razorpay) {
    // Mock payment session so the checkout flow still works end-to-end without real keys.
    // Payment "succeeds" immediately, so the order is confirmed right here — matching what
    // would happen after a real Razorpay success callback.
    const mockPaymentId = `mock_pay_${Date.now()}`;
    order.paymentStatus = 'paid';
    order.paymentId = mockPaymentId;
    await order.save();

    const chef = await Chef.findById(order.chef);
    const customer = await User.findById(order.customer);
    const io = req.app.get('io');
    if (chef && customer) await sendOrderConfirmation({ io, order, customer, chef });

    return success(res, 'Mock payment session created (Razorpay keys not configured)', {
      mock: true,
      paymentId: mockPaymentId,
      amount: order.totalAmount,
    });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100), // paise
    currency: 'INR',
    receipt: order.orderNumber,
  });

  return success(res, 'Razorpay order created', {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc Verify Razorpay payment signature after checkout completes on the client
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return error(res, 'Order not found', 404);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = 'failed';
    await order.save();
    return error(res, 'Payment verification failed', 400);
  }

  order.paymentStatus = 'paid';
  order.paymentId = razorpay_payment_id;
  await order.save();

  // Payment is confirmed — now (and only now) send the order confirmation email + notifications
  const chef = await Chef.findById(order.chef);
  const customer = await User.findById(order.customer);
  const io = req.app.get('io');
  if (chef && customer) await sendOrderConfirmation({ io, order, customer, chef });

  return success(res, 'Payment verified successfully', { order });
});

module.exports = { createPaymentOrder, verifyPayment };
