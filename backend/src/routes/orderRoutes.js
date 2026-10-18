const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getChefOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/chef', authorize('chef'), getChefOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('chef', 'delivery', 'admin', 'superadmin'), updateOrderStatus);

module.exports = router;
