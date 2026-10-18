const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getWallet, addFunds } = require('../controllers/walletController');

router.use(protect);
router.get('/', getWallet);
router.post('/add-funds', addFunds);

module.exports = router;
