const WalletTransaction = require('../models/Wallet');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const getWallet = asyncHandler(async (req, res) => {
  const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return success(res, 'Wallet fetched', { balance: req.user.walletBalance, transactions });
});

const addFunds = asyncHandler(async (req, res) => {
  const { amount, reason = 'Wallet top-up' } = req.body;
  if (!amount || amount <= 0) return error(res, 'Invalid amount');

  const user = await User.findById(req.user._id);
  user.walletBalance += amount;
  await user.save();

  const tx = await WalletTransaction.create({
    user: user._id,
    type: 'credit',
    amount,
    reason,
    balanceAfter: user.walletBalance,
  });

  return success(res, 'Funds added to wallet', { balance: user.walletBalance, transaction: tx });
});

module.exports = { getWallet, addFunds };
