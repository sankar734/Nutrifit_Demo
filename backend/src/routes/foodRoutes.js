const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { createFood, updateFood, deleteFood, getFoods, getFoodDetails } = require('../controllers/foodController');

router.get('/', getFoods);
router.get('/:id', getFoodDetails);

router.post('/', protect, authorize('chef'), createFood);
router.put('/:id', protect, authorize('chef'), updateFood);
router.delete('/:id', protect, authorize('chef', 'admin'), deleteFood);

module.exports = router;
