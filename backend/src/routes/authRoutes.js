const express = require('express');
const router = express.Router();
const {
  registerSendOtp,
  register,
  login,
  resendLoginOtp,
  verifyEmailOtp,
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  refresh,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Unified Registration Flow
router.post('/register/send-otp', registerSendOtp);
router.post('/register', register);

// Unified Login Flow
router.post('/login', login);
router.post('/login/resend-otp', resendLoginOtp);
router.post('/email-otp/verify', verifyEmailOtp);

// Legacy / Helper endpoints
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/email-otp/send', sendEmailOtp);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
