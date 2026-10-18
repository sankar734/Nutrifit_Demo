const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createReview, getChefReviews } = require('../controllers/reviewController');

router.get('/chef/:chefId', getChefReviews);
router.post('/', protect, createReview);

module.exports = router;
