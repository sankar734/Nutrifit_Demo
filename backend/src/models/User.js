const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    addressLine: String,
    city: String,
    state: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['customer', 'chef', 'delivery', 'admin', 'superadmin', 'nutritionist'],
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    healthProfile: {
      age: Number,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      heightCm: Number,
      weightKg: Number,
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      },
      goal: {
        type: String,
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'diabetic_friendly', 'heart_healthy'],
      },
      allergies: [String],
      dietaryPreference: {
        type: String,
        enum: ['veg', 'non_veg', 'vegan', 'eggetarian'],
        default: 'veg',
      },
    },
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    favoriteChefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    fcmTokens: [String],
    refreshTokens: [String],
    otp: { code: String, expiresAt: Date },
  },
  { timestamps: true }
);

userSchema.index({ 'addresses.location': '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.otp;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
