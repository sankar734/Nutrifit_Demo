const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  registerDeliveryPartner,
  toggleOnline,
  updateLocation,
  getAvailableOrders,
  acceptDelivery,
  getMyDeliveries,
  getDeliveryDashboard,
} = require('../controllers/deliveryController');

router.use(protect);
router.post('/register', registerDeliveryPartner);
router.put('/toggle-online', authorize('delivery'), toggleOnline);
router.put('/location', authorize('delivery'), updateLocation);
router.get('/available-orders', authorize('delivery'), getAvailableOrders);
router.put('/accept/:orderId', authorize('delivery'), acceptDelivery);
router.get('/my-deliveries', authorize('delivery'), getMyDeliveries);
router.get('/dashboard', authorize('delivery'), getDeliveryDashboard);

module.exports = router;
