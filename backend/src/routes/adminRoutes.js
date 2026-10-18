const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getDashboardStats,
  listUsers,
  toggleUserActive,
  listChefs,
  updateChefKyc,
  listOrders,
  createCoupon,
  listCoupons,
  updateCommissionRate,
} = require('../controllers/adminController');

router.use(protect, authorize('admin', 'superadmin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', listUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

router.get('/chefs', listChefs);
router.put('/chefs/:id/kyc', updateChefKyc);
router.put('/chefs/:id/commission', updateCommissionRate);

router.get('/orders', listOrders);

router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);

module.exports = router;
