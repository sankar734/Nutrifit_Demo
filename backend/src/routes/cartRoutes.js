const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getCart, addToCart, updateCartItem, clearCart } = require('../controllers/cartController');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;
