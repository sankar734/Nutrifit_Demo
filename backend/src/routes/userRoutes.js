const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  toggleWishlist,
  toggleFavoriteChef,
} = require('../controllers/userController');

router.use(protect);
router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/wishlist/toggle', toggleWishlist);
router.post('/favorite-chef/toggle', toggleFavoriteChef);

module.exports = router;
