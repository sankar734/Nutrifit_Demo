const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  registerChef,
  getNearbyChefs,
  getChefDetails,
  updateChefProfile,
  getChefDashboard,
} = require('../controllers/chefController');

router.get('/nearby', getNearbyChefs);
router.get('/:id', getChefDetails);

router.post('/register', protect, registerChef);
router.put('/profile', protect, authorize('chef'), updateChefProfile);
router.get('/me/dashboard', protect, authorize('chef'), getChefDashboard);

module.exports = router;
