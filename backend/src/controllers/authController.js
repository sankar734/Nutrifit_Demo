const crypto = require('crypto');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

const generateReferralCode = (name) => {
  const prefix = (name || 'USR').substring(0, 3).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
};

// @desc Step 1 of Register: Validate details and send Email OTP
// @route POST /api/auth/register/send-otp
const registerSendOtp = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return error(res, 'Name, email, phone number, and password are all required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedPhone = phone.trim();

  // Email format validation
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return error(res, 'Please provide a valid email address');
  }

  // Phone validation (at least 10 digits)
  const phoneDigits = trimmedPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return error(res, 'Please provide a valid 10-digit mobile number');
  }

  // Password validation
  if (password.length < 6) {
    return error(res, 'Password must be at least 6 characters long');
  }

  // Check if active user already exists with this email or phone
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: trimmedPhone }],
  });
  if (existing) {
    if (existing.email === normalizedEmail) {
      return error(res, 'An account with this email address already exists. Please sign in.');
    }
    return error(res, 'An account with this phone number already exists. Please sign in.');
  }

  // Generate 6-digit OTP
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Store in PendingRegistration (upsert for this email)
  await PendingRegistration.deleteMany({ email: normalizedEmail });
  await PendingRegistration.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: trimmedPhone,
    password, // Stored temporarily until verified, then hashed when User is created
    role: role && ['customer', 'chef', 'delivery'].includes(role) ? role : 'customer',
    otp: { code: otpCode, expiresAt },
  });

  const emailResult = await emailService.sendOtpEmail({ name, email: normalizedEmail }, otpCode);
  console.log(`[AUTH] Registration Email OTP for ${normalizedEmail} (${name}): ${otpCode}`);

  return success(res, emailResult.sent ? 'Verification code sent to your email' : 'Verification code dispatched to your email', {
    email: normalizedEmail,
  });
});

// @desc Step 2 of Register: Verify OTP and create the user account
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email, otp, code } = req.body;
  const otpCode = String(otp || code || '').trim();

  if (!email || !otpCode) {
    return error(res, 'Email and verification OTP code are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const pending = await PendingRegistration.findOne({ email: normalizedEmail });

  if (!pending) {
    return error(res, 'Registration session expired or not found. Please submit registration again.', 400);
  }

  if (pending.otp.code !== otpCode) {
    return error(res, 'Invalid verification code. Please check and try again.', 400);
  }

  if (new Date() > pending.otp.expiresAt) {
    return error(res, 'Verification code has expired. Please request a new one.', 400);
  }

  // Ensure user wasn't registered in the interim
  const existing = await User.findOne({
    $or: [{ email: pending.email }, { phone: pending.phone }],
  });
  if (existing) {
    await PendingRegistration.deleteMany({ email: normalizedEmail });
    return error(res, 'An account with this email or phone already exists. Please sign in.', 400);
  }

  const user = await User.create({
    name: pending.name,
    email: pending.email,
    phone: pending.phone,
    password: pending.password,
    role: pending.role || 'customer',
    isEmailVerified: true,
    referralCode: generateReferralCode(pending.name),
  });

  // Clean up pending registration
  await PendingRegistration.deleteMany({ email: normalizedEmail });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  if (user.email) {
    emailService.sendWelcomeEmail(user).catch(() => {});
  }

  return success(res, 'Registration successful! Welcome to NutriChef.', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  }, 201);
});

// @desc Step 1 of Login: Verify username/email + password and send Email OTP
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return error(res, 'Username/email and password are required');
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const rawIdentifier = identifier.trim();

  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { phone: rawIdentifier }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return error(res, 'Invalid credentials. Please check your username/email and password.', 401);
  }
  if (!user.isActive) {
    return error(res, 'Account is deactivated. Please contact support.', 403);
  }

  // Generate 6-digit OTP for Email 2FA
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  const emailResult = await emailService.sendOtpEmail(user, otpCode);
  console.log(`[AUTH] Login OTP for ${user.email} (${user.name}): ${otpCode}`);

  const maskedEmail = user.email
    ? user.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c)
    : '';

  return success(res, emailResult.sent ? 'Verification OTP sent to your registered email' : 'Verification OTP dispatched to your registered email', {
    requireOtp: true,
    email: user.email,
    name: user.name,
    role: user.role,
    maskedEmail,
  });
});

// @desc Resend Login Email OTP
// @route POST /api/auth/login/resend-otp
const resendLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return error(res, 'Email is required');

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return error(res, 'User not found with this email', 404);

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  const emailResult = await emailService.sendOtpEmail(user, otpCode);
  console.log(`[AUTH] Resent Login OTP for ${normalizedEmail}: ${otpCode}`);

  return success(res, emailResult.sent ? 'New verification OTP sent to your email' : 'New verification OTP dispatched to your email', {
    email: user.email,
  });
});

// @desc Step 2 of Login: Verify email OTP and complete login
// @route POST /api/auth/email-otp/verify
const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, code, otp } = req.body;
  const otpCode = String(code || otp || '').trim();
  if (!email || !otpCode) return error(res, 'Email and OTP code are required');

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.otp || !user.otp.code) return error(res, 'OTP not requested or already expired');
  if (user.otp.code !== otpCode) return error(res, 'Invalid OTP code. Please check and try again.');
  if (user.otp.expiresAt < new Date()) return error(res, 'OTP has expired. Please request a new code.');

  user.isEmailVerified = true;
  user.otp = undefined;

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return success(res, 'Login successful', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @desc Send OTP for phone login (backward compatibility)
// @route POST /api/auth/otp/send
const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) return error(res, 'Phone number is required');

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: 'New User', phone, referralCode: generateReferralCode('USR') });
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  const smsResult = await smsService.sendOtpSms(phone, otpCode);
  console.log(`OTP for ${phone}: ${otpCode}`);

  return success(res, smsResult.sent ? 'OTP sent via SMS' : 'OTP generated (SMS not configured — see devOtp)', {
    devOtp: !smsResult.sent ? otpCode : undefined,
  });
});

// @desc Verify OTP and login (backward compatibility)
// @route POST /api/auth/otp/verify
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;
  const user = await User.findOne({ phone });
  if (!user || !user.otp || !user.otp.code) return error(res, 'OTP not requested');
  if (user.otp.code !== code) return error(res, 'Invalid OTP');
  if (user.otp.expiresAt < new Date()) return error(res, 'OTP expired');

  user.isPhoneVerified = true;
  user.otp = undefined;

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return success(res, 'OTP verified', {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @desc Send OTP to email directly (backward compatibility)
// @route POST /api/auth/email-otp/send
const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return error(res, 'Email is required');

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name: name?.trim() || 'Healthy Foodie',
      email: normalizedEmail,
      referralCode: generateReferralCode(name?.trim() || 'USR'),
    });
  } else if (name && (user.name === 'New User' || user.name === 'Healthy Foodie')) {
    user.name = name.trim();
    await user.save();
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  const emailResult = await emailService.sendOtpEmail(user, otpCode);
  console.log(`[AUTH] Email OTP for ${normalizedEmail} (${user.name}): ${otpCode}`);

  return success(res, emailResult.sent ? 'OTP sent to your email' : 'OTP generated (SMTP not configured — see devOtp)', {
    devOtp: !emailResult.sent ? otpCode : undefined,
    userExists: !user.isNew,
  });
});

// @desc Refresh access token
// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const { refreshToken } = req.body;
  if (!refreshToken) return error(res, 'Refresh token required');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return error(res, 'Invalid refresh token', 401);
    }
    const accessToken = generateAccessToken(user._id, user.role);
    return success(res, 'Token refreshed', { accessToken });
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
});

// @desc Logout
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (req.user && refreshToken) {
    req.user.refreshTokens = req.user.refreshTokens.filter((t) => t !== refreshToken);
    await req.user.save();
  }
  return success(res, 'Logged out successfully');
});

// @desc Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, 'User fetched', { user: req.user.toSafeObject() });
});

module.exports = {
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
};
